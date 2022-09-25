const dbo = require("../db/conn");
const axios = require('axios');
const fs = require('fs');
const write_file = require('./file_writer');


const sap_endpoint = true ? "https://10.10.10.4:50000/b1s/v1/" : "https://20.225.223.249:55000/b1s/v1/";
const sap_auth = sap_endpoint + "Login";
const body = { "CompanyDB": "PRUEBAS_PODER_JUSTO", "UserName": "pj_sistemas", "Password": "W4M2NS4y9h" };

function url_for_endpoint(object, n) {
    return sap_endpoint + object + "?$skip=" + String(n);
};

async function fetch_cookie() {
    const c = await axios.post(sap_auth, body).then(r => r.headers["set-cookie"]);
    return { headers: { Accept: 'application/json', Cookie: c } }
};

async function write_table_mongoDB(mongo, data, table_title) {
    return await mongo.collection(table_title).insertMany(data, function (err, res) {
        if (err) throw err;
    });
};

function extract_suppliers (a){
    return a.filter( x  => x.CardType !=="cCustomer")
}

module.exports = async function fetch_SAPB1_write_MONGO(table, table_title) {
    var counter = 0;

    let db_connect = dbo.getDb();
    const write_local = true;
    const cookie = await fetch_cookie();
    var petition_response = {data: {'odata.nextLink': true}}
    var aggregate = [];

    while(!!petition_response.data['odata.nextLink']) {
        const endpoint = url_for_endpoint(table, counter);
        petition_response = await axios.get(endpoint, cookie).then( r => r);
        // console.log(petition_response)
         var buff;
        if(table === "BusinessPartners"){
            buff= extract_suppliers(petition_response.data.value);
            console.log(aggregate);
        }else{
            buff = petition_response.data.value;
        }

        aggregate.push( ...buff );
        console.log("this is the aggregate", aggregate.length)
      

        // !write_local && write_table_mongoDB(db_connect, aggregate, table_title);

        const additional_condition = counter % 200 ===0 && aggregate.length >0;

        const check_local_write = write_local && (!petition_response.data['odata.nextLink']);

        if(check_local_write){
            await write_file(
                "./RawData/" + table_title + "-" + String(counter)+".json", 
                JSON.stringify(aggregate)
            )
        };
        counter += 20;
    };
    return aggregate;
};

