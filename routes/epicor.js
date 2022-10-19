const express = require("express");
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require('mongodb').ObjectId;
const fetch_SAPB1_write_MONGO = require('../SAPB1_helpers/utils');
const purchase_credit_notes = require('../SAPB1_helpers/credit_notes_parser');
const purchase_invoices = require('../SAPB1_helpers/purchase_invoices_parser');
const parse_suppliers = require('../SAPB1_helpers/suppliers_parser')
const fetch_SAPB1_write_LOCAL = require('../SAPB1_helpers/vendor_payments_parser');
const read_write_vendor_payments = require('../SAPB1_helpers/VendorUtils/write_excel_format');



const requestHeaders = {
  Accept: 'application/json',
};

const options = { headers: requestHeaders };

recordRoutes.route("/insert").post(function (req, response) {
  const path = req.body.path; const data = req.body;
  let db_connect = dbo.getDb();

  db_connect.collection(path).insertOne(data, function (err, res) {
    if (err) throw err;
    response.json(res);
  });
});

recordRoutes.route("/read/link/:id").get(async function (req, res) {
  const id = req.params.id;
  let db_connect = dbo.getDb();
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





recordRoutes.route("/api/:object_doc").get(async function (req, res) {
  const path = req.params.object_doc;

  const documents = {
    "purchase-invoices-x" : "PurchaseInvoices",
    "purchase-credit-notes-x" : "PurchaseInvoices",
    "inventory-x" : "Items",
    "purchase-orders-xx" : "PurchaseOrders",
    "vendor-payments-x" : "VendorPayments",
    "suppliers-detail-x" : "BusinessPartners",
  };

  const document_object = documents[path];
  try
  {
    await fetch_SAPB1_write_MONGO( document_object ,path);
    res.send({invoices: "success"});
  } 
  catch(e)
  {
    console.log(e)
    res.send({e})
  }
});




recordRoutes.route("/read/pi/:table").get(async function (req, res) {
  const path = req.params.table;
  console.log(path);
  let db_connect = dbo.getDb();
  const r = await db_connect
    .collection(path)
    .find({})
    .toArray(async function (err, result) {
      if (err) throw err;
      await purchase_credit_notes(result);
      res.send({"success": result.length});
    });
});

async function fetch_MONGODB_process_LOCALLY (path, db_connect, limit, skip){
  return db_connect
  .collection(path)
  .find({})
  .limit(limit)
  .skip(skip)
  .toArray(async function (err, result) {
    if (err) throw err;
    var r= await purchase_invoices(result);
    // console.log(r);
    return r;
  });
}

recordRoutes.route("/api/read_all/:table").get(async function (req, res) {
  const path = req.params.table;
  let db_connect = dbo.getDb("saldada-v1");
  var skip_counter = 0;
  var database_response = ["42069"];
  // database_response = await fetch_MONGODB_process_LOCALLY(path, db_connect, 100, skip_counter);
  // console.log(database_response);
  // res.send({success: database_response})
  console.log(database_response)

  while(!!database_response){
    database_response = await fetch_MONGODB_process_LOCALLY(path, db_connect, 100, skip_counter);
    console.log(skip_counter)
    console.log(database_response)
    skip_counter+=100;
  };
  console.log("exited")
    // await res.send({success: database_response})

});

recordRoutes.route("/api/v1/parse_vendor_payments").get(async function (req, res) {

  // await fetch_SAPB1_write_LOCAL("VendorPayments")
  read_write_vendor_payments("document name")

});

module.exports = recordRoutes;