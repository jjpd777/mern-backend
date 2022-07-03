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

const headers = { 
  'Authorization': 'Bearer my-token',
  'My-Custom-Header': 'foobar'
};

recordRoutes.route("/insertData").get(async function (req, response) {
  let db_connect = dbo.getDb(MAIN_TABLE);
  /// read the csv file
  const data_origin = "https://firebasestorage.googleapis.com/v0/b/saldada-dev.appspot.com/o/xepelin_sample.xlsx%20-%20Worksheet.tsv?alt=media&token=390ab1a4-2278-40bc-acac-6e9a33d52a46";
  const fetched_data = await axios.get(data_origin, options)
    .then(data_tsv => { 
    const tsv_split = data_tsv.data.split("\r\n"); const reference_keys = tsv_split[0].split("\t"); const temp_data = [];
    tsv_split.map( (row, ix)=>{
      if(ix!==0){
        const d = row.split("\t"); const objct = {};
        d.map( (x, index) =>{
          objct[reference_keys[index]]= x
        })
        temp_data.push(objct);
      }
    });
    console.log(temp_data.length);
    axios.post( 'https://whbackend.herokuapp.com/receive_information', {body: temp_data[0]}, {headers} );
    // return temp_data;
    response.send({status: temp_data})  
  });
  console.log("This is the operation response", fetched_data);

  // await axios.post( 'https://whbackend.herokuapp.com/receive_information', {body: fetched_data[0]}, {headers} ).then( x=> response.send({value: "success"}))

  // response.send(dbentry)

  /// write csv file to MongoDB
  /// potentially, break it down in several steps
});

recordRoutes.route("/receive_information").post(function (req, response) {
try{
  console.log(req.body, "the body");
  response.send({"status": "everything gucci"})

}catch (e){
  console.log(e)
}
});


module.exports = recordRoutes;