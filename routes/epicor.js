const express = require("express");
const MAIN_TABLE = "saldada-v1";
const CUSTOMERS_TABLE = "terms";


// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");


// This section will help you get a list of all the records.
recordRoutes.route("/fetchEpicor").get(function (req, res) {
  let db_connect = dbo.getDb(MAIN_TABLE);
  db_connect
    .collection(CUSTOMERS_TABLE)
    .find({})
    .toArray(function (err, result) {
      if (err) throw err;
      res.json(result);
    });
});


module.exports = recordRoutes;