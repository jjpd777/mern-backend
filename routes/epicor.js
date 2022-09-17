const express = require("express");
const MAIN_TABLE = "POWER_J";
const CUSTOMERS_TABLE = "terms";
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require('mongodb').ObjectId;
const fetch_data_SAPB1 = require('../SAPB1_helpers/utils');


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


// ###########################################################################################
// ###########################################################################################





recordRoutes.route("/sapb1_vendor_payments").get(async function (req, res) { 
  try{

    await fetch_data_SAPB1( "Invoices","customer-invoices-full");

    res.send({invoices: "success"});

  } catch(e){
    console.log(e)
    res.send({e})
  }
});

recordRoutes.route("/read/pi/:table").get(function (req, res) {
  const path = req.params.table;
  console.log(path);
  let db_connect = dbo.getDb(MAIN_TABLE);
  db_connect
    .collection(path)
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      console.log(result.length)
      res.json(result);
    });
});




module.exports = recordRoutes;