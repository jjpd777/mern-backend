const express = require("express");
const MAIN_TABLE = "saldada-v1";
const CUSTOMERS_TABLE = "customer-record";
const recordRoutes = express.Router();
const axios = require('axios');
var parse = require('parse-link-header');

function fintocURL(issueType, linkToken, page){
    const lt = "link_token=" + linkToken;
    const it =  "&issue_type="+issueType;
    const pg = "&page="+String(page);
    return 'https://api.fintoc.com/v1/invoices?'+lt+it+pg;
  
  };
  
  const pingListInvoices = async (issueType, linkToken, page) => {
    const options = {
      headers: { Accept: 'application/json', Authorization: 'sk_live_DWeF3Tfp2YCsVQoB3a-MPYAuz8JMLsb6' }
    };
    const d = fintocURL(issueType, linkToken, page);
    return axios.get(d, options)
      .then(response => { 
        //   console.log("Fintoc backend", Object.keys(response), typeof(response), "babyyy"); 
        //   console.log("Fintoc headers", Object.keys(response.headers.link), response.headers.link, "babyyy"); 
  
          return response 
        })
      .catch(err => console.error(err));
  };

  function unifyInvoices (all_inv){
    var unique = [];
    console.log(all_inv.length)
    console.log(Object.keys(all_inv))
    all_inv.map(x=>{
        x.map(xx=> {
            unique.push(xx);
            console.log(xx)
            // const k = Object.keys(xx);
            // k.map(xxx=> {unique.push(xx[xxx]); console.log(xx[xxx])})
        });
    })
    // console.log(unique.length)
    return unique;
    // all_inv.map(x=> unique.includes(x.issuer.name) ? null: unique.push(x.issuer) )
    // console.log(unique);
  };

  function getUniqueBuyers(all){
      var u = [];
      all.map(x=> u.includes(x.issuer.name) ? null: u.push(x.issuer) )
        return u;
  }

  async function objectParser(obj){
    const k = Object.keys(obj);
    var r = [];
     k.map(kk=>r.push(obj[kk].data));
    //  k.map(kk=>console.log("YE",obj[kk].data));
    const inv = unifyInvoices(r);
    console.log(inv.length)
    // console.log(getUniqueBuyers(inv))


     return r;
}

  async function getAllData(listOfURLs){
    const options = {
        headers: { Accept: 'application/json', Authorization: 'sk_live_DWeF3Tfp2YCsVQoB3a-MPYAuz8JMLsb6' }
      };
      (async () => {
        try {
          axios.all(listOfURLs.map((endpoint) => axios.get(endpoint, options))).then(
            (data) =>{
                console.log(typeof(data), data.length);
                const k = Object.keys(data);
                console.log(k)
                console.log("DA",typeof(data[0]), Object.keys(data[0]), data[0].data[0])

                // k.map(x=> typeof(data[x]));
                return data}
          );
      
        } catch (error) {
          console.log(error);
        }
      })();
  };

 

  function listOfPetitions(pagesObject){
      const last = pagesObject.last;
      var r = [];
      for(var i=1; i< Number(last.page)+1; i++){
        r.push(fintocURL(last.issue_type,last.link_token,i));
      };
      return r;

  };

  
  
  recordRoutes.route("/processSAT/:token").get(function (req, res) {
  const token = req.params.token;

  (async () => {
    try {
      const fetchReceived = await pingListInvoices("received", token,1);
      const parsedReceived = parse(fetchReceived.headers.link);
      const fetchIssued = await pingListInvoices("issued", token,1);
      const parsedIssued = parse(fetchIssued.headers.link);

      const p_received = listOfPetitions(parsedReceived);
      const p_issued = listOfPetitions(parsedIssued);

    //   const asyncAllReceived =  await getAllData(p_received);
      const asyncAllIssued =  await getAllData(p_issued);
    //   console.log(typeof(asyncAllIssued))
    //   const k = Object.keys(asyncAllIssued);
    //   const all_y = k.map(x, ix=> asyncAllIssued[k].data);
    //   console.log(all_y.length)
    //   console.log(asyncAllIssued);
    //   console.log(asyncAllIssued);

      console.log(asyncAllIssued)
      res.json(fetchIssued.data);
    } catch (error) {
      console.log(error);
    }
  })();
  
  });

module.exports = recordRoutes;