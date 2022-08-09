const express = require("express");
const MAIN_TABLE = "saldada-v1";
const CUSTOMERS_TABLE = "terms";
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require('mongodb').ObjectId;
const axios = require('axios');


const requestHeaders = {
  Accept: 'application/json',
};

const options = { headers: requestHeaders };

recordRoutes.route("/insert").post(function (req, response) {
  const path = req.body.path; const data = req.body;
  let db_connect = dbo.getDb(MAIN_TABLE);

  db_connect.collection(path).insertOne(data, function (err, res) {
    if (err) throw err;
    response.json(res);
  });
});

recordRoutes.route("/read/link/:id").get(async function (req, res) {
  const id = req.params.id;
  let db_connect = dbo.getDb(MAIN_TABLE);
  const result = await db_connect
    .collection("link_table")
    .findOne({"_id": ObjectId(id)});
    console.log(result)
  if(result){
    res.send(result)
  }
  else{
    res.send({message:"terrible error just happened"})
  }
});

recordRoutes.route("/read/list/:table").get(function (req, res) {
  const path = req.params.table;
  console.log(path);
  let db_connect = dbo.getDb(MAIN_TABLE);
  db_connect
    .collection("link_table")
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});


function structure_petitions_body(parsed_data){
  const petitions_arr = [];
  const max_len = 25;
  const sub_arrays = Math.floor(parsed_data.length / max_len) 
  const remainder = parsed_data.length % max_len;

  for( let i =0; i< sub_arrays; i++){
    petitions_arr.push( parsed_data.slice(i*max_len, (i+1)*max_len))
  };
  if(remainder !== 0){
    petitions_arr.push(parsed_data.slice( sub_arrays * max_len , ( sub_arrays*max_len ) + remainder))
  }
  return petitions_arr;
}

recordRoutes.route("/insertData").get(async function (req, response) {
  /// read the csv file
  const data_origin = "https://firebasestorage.googleapis.com/v0/b/saldada-dev.appspot.com/o/xepelin_sample.xlsx%20-%20Worksheet.tsv?alt=media&token=390ab1a4-2278-40bc-acac-6e9a33d52a46";
  await axios.get(data_origin, options)
    .then(data_tsv => { 
      const tsv_split = data_tsv.data.split("\r\n"); const reference_keys = tsv_split[0].split("\t");
      const parsed_data = []; 
      tsv_split.map( (row, ix)=>{
        if(ix!==0){
          const d = row.split("\t"); const objct = {
            "dependency_score" : "TOP_SUPPLIER",
            "year_first_purchase" : "2017",
            "average_purchase" : "44,7994.00"
          };
          d.map( (x, index) =>{ objct[reference_keys[index]]= x })
          parsed_data.push(objct);
        };
      });
      
      const postReqHeaders = { 
        'Authorization': 'da2-q5daqbihpfa4plpkk7emyf7m3e',
        'Accept': 'application/json',
        'enterprise' : "AGROSUPER",
      };

      const structured_petitions = structure_petitions_body(parsed_data);
      const hrk = 'https://whbackend.herokuapp.com/receive_information';
      const lcl = 'http://localhost:5000/receive_information';
      const xep = 'https://ubx5pawdbrbynmkkv77xuqpn34.appsync-api.us-east-1.amazonaws.com/graphql';
      // structured_petitions.map( petition =>{
      //   axios.post( xep , {data: petition}, { headers: postReqHeaders } ).then( r =>{ console.log(r.data)})
      // })
      axios.post( xep , {data: structured_petitions[0]}, { headers: postReqHeaders} ).then( r =>{ console.log(r.data)})
      response.send({status: parsed_data})  
  });
});

function return_graphql_data(data_list){
  return JSON.stringify({
    query: `mutation MyMutation {
    batchCreateInvoice(invoices: 
    [
        { 
          confirmedAt: "2022-06-03T00:00:00.000Z",
          folio: "9233", 
          country: CL, 
          identifier: "96301260-7_82580320-7_33_2000",   
          supplierIdentifier: "92580320-7",
          payerIdentifier:"76301260-8", 
          issueDate: "2022-06-01T00:00:00.000Z", 
          invoiceType: "33", 
          amount: 2000.3
      },
      { 
          confirmedAt: "2022-06-03T00:00:00.000Z",
          folio: "9233",  
          country: MX, 
          identifier: "123e4567-e89b-12d3-a456-426655440000", 
          supplierIdentifier: "PSI890102K66", 
          payerIdentifier:"SCBK210303FP1",
          issueDate: "2022-06-01T00:00:00.000Z", 
          invoiceType: "PDU", 
          amount: 2000.3
      }
    ]) {
      identifier
    }
  }`,
    variables: {}
  });
}

recordRoutes.route("/xepelin_graphql").get(async function (req, response) {
  /// read the csv file
  const data_origin = "https://firebasestorage.googleapis.com/v0/b/saldada-dev.appspot.com/o/xepelin_sample.xlsx%20-%20Worksheet.tsv?alt=media&token=390ab1a4-2278-40bc-acac-6e9a33d52a46";
  await axios.get(data_origin, options)
    .then(data_tsv => { 
      const tsv_split = data_tsv.data.split("\r\n"); const reference_keys = tsv_split[0].split("\t");
      const parsed_data = []; 
      tsv_split.map( (row, ix)=>{
        if(ix!==0){
          const d = row.split("\t"); const objct = {
            "dependency_score" : "TOP_SUPPLIER",
            "year_first_purchase" : "2017",
            "average_purchase" : "44,7994.00"
          };
          d.map( (x, index) =>{ objct[reference_keys[index]]= x })
          parsed_data.push(objct);
        };
      });
      const xepelin_url = 'https://ubx5pawdbrbynmkkv77xuqpn34.appsync-api.us-east-1.amazonaws.com/graphql';
      const structured_petitions = structure_petitions_body(parsed_data);
      const data = return_graphql_data(structured_petitions[0]);
      console.log(typeof(data))

      var config = {
        method: 'post',
        url: xepelin_url,
        headers: { 
          'x-api-key': 'da2-q5daqbihpfa4plpkk7emyf7m3e',
          'Content-Type': 'application/json',
        },
        data : data
      };
      axios(config)
        .then(function (response) {
          // console.log(JSON.stringify(response.data));

          console.log(response.data.errors, "error field")
        });
      response.send({status: "everything gucci"});
 
  
  });
});

recordRoutes.route("/receive_information").post(function (req, response) {
const summary =  'Entered a total of ' + req.body.data.length;

try{
  console.log(req)
  const path = req.header.enterprise; const data = req.body.data;
  let db_connect = dbo.getDb(MAIN_TABLE);

  // db_connect.collection("AGROSUPER").insertMany( data, function (err, res) {
  //   if (err) throw err;
  // });
  response.send({
    "status": 200,
    'message' : 'information posted successfully!',
    'summary' : summary
  });

}catch (e){
  console.log(e)
}
});

recordRoutes.route("/sapb1_invoices").get(async function (req, res) {
  const sap_url = "https://20.225.223.249:55000/b1s/v1/Login";
    console.log(req)
    const body = {"CompanyDB" : "SBODEMOMX", "UserName": "manager", "Password": "manager" };

    function url_return (n){ return "https://20.225.223.249:55000/b1s/v1/Invoices?$skip="+ String(n);}
    async function fetch_invoices(cookie){
      const h = {headers:{  Accept: 'application/json', Cookie: cookie }}
      var counter = 0; 

      const inv_url = url_return(counter);
      var fetch_data = await axios.get(inv_url, h);
      const aggregate = [fetch_data.data.value];
      
      while(!!fetch_data.data['odata.nextLink'] && counter<20){
        console.log(fetch_data.data['odata.nextLink'])
        counter+=20;
        var pop = await axios.get(url_return(counter), h).then( responz => {return responz});
        aggregate.push( pop.data.value)
        fetch_data = pop;

      }
      return aggregate;
    }
    async function fetch_cookie() {
       return await axios.post(sap_url, body) 
    }
    
  try{
    const cookie = await fetch_cookie().then( r => r.headers["set-cookie"] );
    const ft = await fetch_invoices(cookie);
    res.send({invoices: ft});

  } catch(e){
    console.log(e)
    res.send({e})
  }
});




module.exports = recordRoutes;