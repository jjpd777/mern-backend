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
  const sub_arrays = Math.floor(parsed_data.length / 30) 
  const remainder = parsed_data.length % 30;

  for( let i =0; i< sub_arrays; i++){
    petitions_arr.push( parsed_data.slice(i*30, (i+1)*30))
  };
  if(remainder !== 0){
    petitions_arr.push(parsed_data.slice( sub_arrays * 30 , ( sub_arrays*30 ) + remainder))
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
        'Authorization': 'RAUL-JOAQUIN-JUAN-2022',
        'Accept': 'application/json',
        'enterprise' : "AGROSUPER",
      };

      const structured_petitions = structure_petitions_body(parsed_data);
      const hrk = 'https://whbackend.herokuapp.com/receive_information';
      const lcl = 'http://localhost:5000/receive_information';
      structured_petitions.map( petition =>{
        axios.post( hrk , {data: petition}, {postReqHeaders} ).then( r =>{ console.log(r.data)})
      })
      response.send({status: parsed_data})  
  });
});

recordRoutes.route("/receive_information").post(function (req, response) {
const summary =  'Entered a total of ' + req.body.data.length;
try{
  const path = req.headers.enterprise; const data = req.body.data;
  let db_connect = dbo.getDb(MAIN_TABLE);

  db_connect.collection(path).insertOne(JSON.stringify({...data}), function (err, res) {
    if (err) throw err;
    response.json(res);
  });
  response.send({
    "status": 200,
    'message' : 'information posted successfully!',
    'summary' : summary
  });

}catch (e){
  console.log(e)
}
});


module.exports = recordRoutes;