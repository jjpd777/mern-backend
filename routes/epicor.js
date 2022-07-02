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

recordRoutes.route("/insertData").get(function (req, response) {
  let db_connect = dbo.getDb(MAIN_TABLE);
  /// read the csv file
  const dest_exel = "https://firebasestorage.googleapis.com/v0/b/saldada-dev.appspot.com/o/xepelin_sample.xlsx%20-%20Worksheet.tsv?alt=media&token=390ab1a4-2278-40bc-acac-6e9a33d52a46";
  axios.get(dest_exel, options).then(response => { 
    const other_data = response.data.split("\r\n");
    const reference_keys = other_data[0].split("\t");
    const dbentry = [];
    other_data.map( (row, ix)=>{
      if(ix!==0){
        const d = row.split("\t");
        const objct = {};
        d.map( (x, index) =>{
          objct[reference_keys[index]]= x
        })
        dbentry.push(objct);
      }
    });

    console.log(dbentry.length)


    return response
  
  })

  /// write csv file to MongoDB
  /// potentially, break it down in several steps

  db_connect.collection("sample_xepe").insertOne({"sample":"data"}, function (err, res) {
    if (err) throw err;
    response.json(res);
  });
});

recordRoutes.route("/receive_information").post(function (req, response) {
  const path = req.body.path; const data = req.body;
  let db_connect = dbo.getDb(MAIN_TABLE);
  console.log(data);
});


module.exports = recordRoutes;