const express = require("express");
const MAIN_TABLE = "saldada-v1";
const CUSTOMERS_TABLE = "terms";


// recordRoutes is an instance of the express router.
// We use it to define our routes.
// The router will be added as a middleware and will take control of requests starting with path /record.
const recordRoutes = express.Router();

// This will help us connect to the database
const dbo = require("../db/conn");

recordRoutes.route("/create").post(function (req, response) {
  let db_connect = dbo.getDb(MAIN_TABLE);
  console.log(req.body, "the body request")
  const path = "/testing/epicor";
  const data = {
    admin:{
        created_by:"juan@gmail.com",
        uid: "thisfsdfjjf99fjsd",
        deleted: "false"
    },
    customer:{
        company_name:"Name of Company",
        fiscal_id: "RFC or RUT",
        email: "juan@gmail.com",
        phone:"+17863016023",
    },
    link:{
        company: "Name of Company Linked",
        erp: "Name of ERP linked",
        status: "active or pending",
        country: "Mexico or Chile",
        last_refreshed:"timestamp"
    },
    xlsx : {
        "01-07-2022" : "https://www.firebase.com/xlsx/01-07-2022.xlsx",
        "02-07-2022" : "https://www.firebase.com/xlsx/01-07-2022.xlsx",
        "03-07-2022" : "https://www.firebase.com/xlsx/01-07-2022.xlsx",
        "04-07-2022" : "https://www.firebase.com/xlsx/01-07-2022.xlsx",
    }

};
  db_connect.collection(path).insertOne(data, function (err, res) {
    if (err) throw err;
    response.json(res);
  });
});


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