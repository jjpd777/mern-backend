const express = require("express");
const MAIN_TABLE = "saldada-v1";
const CUSTOMERS_TABLE = "customer-record";
const recordRoutes = express.Router();
const axios = require('axios');
var parse = require('parse-link-header');

function fintocURL(issueType, linkToken, page) {
    const lt = "link_token=" + linkToken;
    const it = "&issue_type=" + issueType;
    const pg = "&page=" + String(page);
    return 'https://api.fintoc.com/v1/invoices?' + lt + it + pg;

};

const pingListInvoices = async (issueType, linkToken, page) => {
    const options = {
        headers: { Accept: 'application/json', Authorization: 'sk_live_DWeF3Tfp2YCsVQoB3a-MPYAuz8JMLsb6' }
    };
    const d = fintocURL(issueType, linkToken, page);
    return axios.get(d, options)
        .then(response => { return response })
        .catch(err => console.error(err));
};



function getUniqueSellers(all) {
    var u = {};
    all.map(x => u[x.issuer.id] ? u[x.issuer.id].push(x) : u[x.issuer.id] = [x] );
    // console.log(u, "here baby")
    return u;
}


function getUniqueBuyers(all) {
    var u = {};
    all.map(x => u[x.receiver.id] ? u[x.receiver.id].push(x) : u[x.receiver.id] = [x] );
    // console.log(u, "INGETELCA CUSTOMERS");
    return u;
}


async function getAllData(listOfURLs) {
    const options = {
        headers: { Accept: 'application/json', Authorization: 'sk_live_DWeF3Tfp2YCsVQoB3a-MPYAuz8JMLsb6' }
    };
    try {
        return axios.all(listOfURLs.map((endpoint) =>
            axios.get(endpoint, options))).then(
                (response) => {
                    var parsed = [];
                    response.map(r => {
                        r.data.map(individual => parsed.push(individual));
                    });
                    return parsed;
                }
            );
    } catch (error) {
        console.log(error);
    }
};



function listOfPetitions(pagesObject) {
    const last = pagesObject.last;
    var r = [];
    for (var i = 1; i < Number(last.page) + 1; i++) {
        r.push(fintocURL(last.issue_type, last.link_token, i));
    };
    return r;
};

function summarizeCompany(invoices){
    var global = [];
    const k = Object.keys(invoices);
    k.map( rfc=>{
        var summary={
            customer_rfc: rfc,
            totalSales: 0,
            tax_period:{}
        }
        invoices[rfc].map( item =>{
            summary.totalSales+= Number(item.total_amount);
            const ins = {
                customer_name: item.issuer.name, 
                ticket_amount: item.total_amount,
            }
            if(!summary.tax_period[item.tax_period]){
               summary.tax_period[item.tax_period] = [ins]
            }else{
                summary.tax_period[item.tax_period].push(ins);
            }
        })
        global.push(summary);
    })
    console.log(global);
}



recordRoutes.route("/processSAT/:token").get(function (req, res) {
    const token = req.params.token;

    (async () => {
        try {
            const fetchReceived = await pingListInvoices("received", token, 1);
            const parsedReceived = parse(fetchReceived.headers.link);
            const fetchIssued = await pingListInvoices("issued", token, 1);
            const parsedIssued = parse(fetchIssued.headers.link);

            const p_received = listOfPetitions(parsedReceived);
            const p_issued = listOfPetitions(parsedIssued);

            const asyncAllReceived = await getAllData(p_received);
            const asyncAllIssued = await getAllData(p_issued);

            console.log(asyncAllReceived.length, "Received tax invoices");
            console.log(asyncAllIssued.length, "Issued tax invoices");

            const groupedSellers = getUniqueSellers(asyncAllReceived);
            const groupedBuyers = getUniqueBuyers(asyncAllIssued);
            summarizeCompany(groupedBuyers);

            res.json(fetchIssued.data);
        } catch (error) {
            console.log(error);
        }
    })();

});

module.exports = recordRoutes;