const dbo = require("../db/conn");
const axios = require('axios');
const fs = require('fs');


const sap_endpoint = true ? "https://10.10.10.4:50000/b1s/v1/" : "https://20.225.223.249:55000/b1s/v1/";
const sap_auth = sap_endpoint + "Login";
const body = { "CompanyDB": "PRUEBAS_PODER_JUSTO", "UserName": "pj_sistemas", "Password": "W4M2NS4y9h" };

function url_for_endpoint(object, n) {
    return sap_endpoint + object + "?$skip=" + String(n);
};

async function fetch_cookie() {
    return await axios.post(sap_auth, body).then(r => r.headers["set-cookie"]);
};

async function write_table_mongoDB(mongo, data, table_title) {
    return await mongo.collection(table_title).insertMany(data, function (err, res) {
        if (err) throw err;
    });
}

module.exports = async function fetch_data_SAPB1(table, table_title) {

    const cookie = await fetch_cookie();
    const h = { headers: { Accept: 'application/json', Cookie: cookie } };

    var counter = 0;
    const fetch_url = url_for_endpoint(table, counter);
    var fetch_data = await axios.get(fetch_url, h);

    var aggregate = [];
    aggregate.push(...fetch_data.data.value);
    let db_connect = dbo.getDb("powerJUSTO");


    while (!!fetch_data.data['odata.nextLink']) {
        counter += 20;
        const endpoint = url_for_endpoint(table, counter);
        var pop = await axios.get(endpoint, h).then(responz => { return responz });
        aggregate.push(...pop.data.value);

        if (counter % 200 === 0) {
            write_table_mongoDB(db_connect, aggregate, table_title);
            aggregate = [];
        }
        fetch_data = pop;
    };
    if (aggregate.length !== 0) {
        write_table_mongoDB(db_connect, aggregate, table_title);
    };
    return aggregate;
};

async function write_file(file_string, file) {
    return fs.writeFile(file_string, file, 'utf8', function (err) {
        if (err) {
            console.log("An error occured while writing JSON Object to File.");
            return console.log(err);
        }
        return console.log("JSON file has been saved.");
    })

};