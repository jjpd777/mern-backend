const express = require("express");
const MAIN_TABLE = "saldada-v1";
const CUSTOMERS_TABLE = "customer-record";
const axios = require('axios');
var parse = require('parse-link-header');

// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

// This help convert the id from string to ObjectId for the _id.
const ObjectId = require("mongodb").ObjectId;


// This section will help you get a list of all the records.
recordRoutes.route("/fetch").get(function (req, res) {
  let db_connect = dbo.getDb(MAIN_TABLE);
  db_connect
    .collection(CUSTOMERS_TABLE)
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

recordRoutes.route("/fetchLinkId/:token").get(function (req, res) {
  const token = req.params.token;
  console.log(token, "this email");
  let db_connect = dbo.getDb(MAIN_TABLE);
  db_connect
    .collection("fintoc-user")
    .find({"user.email": token})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});

recordRoutes.route("/fetchLinkToken/:token").get(function (req, res) {
  const token = req.params.token;
  console.log(token, "this token")
  let db_connect = dbo.getDb(MAIN_TABLE);
  db_connect
    .collection(CUSTOMERS_TABLE+"/tokens")
    .find({id: token})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});


// This section will help you get a single record by id
// recordRoutes.route(CUSTOMERS_TABLE+"/:id").get(function (req, res) {
//   let db_connect = dbo.getDb();
//   let myquery = { _id: ObjectId( req.params.id )};
//   db_connect
//       .collection(CUSTOMERS_TABLE)
//       .findOne(myquery, function (err, result) {
//         if (err) throw err;
//         res.json(result);
//       });
// });

// This section will help you create a new record.
recordRoutes.route("/create").post(function (req, response) {
  let db_connect = dbo.getDb();
  console.log(req.body)
  const path = req.body.path;
  const data = req.body.data;
  db_connect.collection(path).insertOne(data, function (err, res) {
    if (err) throw err;
    response.json(res);
  });
});



module.exports = recordRoutes;