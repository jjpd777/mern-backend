const express = require("express");
const MAIN_TABLE = "POWER_J";
const CUSTOMERS_TABLE = "terms";
const recordRoutes = express.Router();
const dbo = require("../db/conn");
const ObjectId = require('mongodb').ObjectId;
const axios = require('axios');
const fs = require('fs');
const path = require('path');


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

recordRoutes.route("/insert_supplier_invoices").get(async function (req, res) {

  let db_connect = dbo.getDb(MAIN_TABLE);

  const directoryPath = path.join(__dirname, 'Documents');
  fs.readdir("./VP", function (err, files) {
    //handling error
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    //listing all files using forEach
    files.forEach( async function (file) {
        // Do whatever you want to do with the file
        let rawdata = fs.readFileSync("./VP/"+file);
        let data = JSON.parse(rawdata);
        console.log(file); 
        await db_connect.collection("PODER_JUSTO").insertMany( data, function (err, res) {
          if (err) throw err;
        });
        
        });
    });


  res.send({status:"gud"})
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
      const xepelin_url = 'https://ubx5pawdbrbynmkkv77xuqpn34.appsync-api.us-east-1.amazonaws.com/graphql';
      const data = return_graphql_data([]);
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
      axios(config).then( r => console.log(r)).catch(e=> console.log(e, "error mf"))
      response.send({status: "everything gucci"});
    ;
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




// ###########################################################################################
// ###########################################################################################
// ###########################################################################################


const sap_endpoint = true ? "https://10.10.10.4:50000/b1s/v1/" : "https://20.225.223.249:55000/b1s/v1/";
const sap_auth = sap_endpoint+ "Login";
const body = {"CompanyDB" : "PRUEBAS_PODER_JUSTO", "UserName": "pj_sistemas", "Password": "W4M2NS4y9h" };
async function fetch_cookie() {
       return await axios.post(sap_auth, body).then( r => r.headers["set-cookie"] );
};

function url_for_endpoint (object, n){ 
  return sap_endpoint + object + "?$skip="+ String(n);
};


async function write_sync (name,data){
  try { 
  fs.writeFileSync(name, data); 
  console.log("File has been saved."); 
  } catch (error) { 
  console.error(err); 
  } 
}



async function write_file( file_string, file){
  return fs.writeFile(file_string, file, 'utf8', function (err) {
      if (err) {
          console.log("An error occured while writing JSON Object to File.");
          return console.log(err);
      }
      return  console.log("JSON file has been saved.");
  })

};
async function fetch_data_SAPB1(cookie, table, chunk){
  const h = { headers:{ Accept: 'application/json', Cookie: cookie }};
  var counter = 33020;

  const fetch_url = url_for_endpoint( table, counter);
  var fetch_data = await axios.get(fetch_url, h);

  var aggregate = [];
  aggregate.push(...fetch_data.data.value);
  let db_connect = dbo.getDb("powerJUSTO");

  
  while(!!fetch_data.data['odata.nextLink']){
    counter+=20;
    const endpoint = url_for_endpoint(table, counter);
    var pop = await axios.get( endpoint , h).then( responz => {return responz});
    aggregate.push(...pop.data.value);


    if(counter%200 ===0){
          // await write_file("./CreditNotes/purchase-inv-"+String(counter)+".json", JSON.stringify(aggregate));
          console.log(db_connect);
          await db_connect.collection("purchase-invoices-full").insertMany( aggregate, function (err, res) {
            console.log("this mfqer")
            if (err) throw err;
          });
          aggregate=[];
    }
    fetch_data = pop;
  };
  if(aggregate.length!==0){
      // await write_file("./CreditNotes/purchase-inv-"+String(counter)+".json", JSON.stringify(aggregate));
      await db_connect.collection("purchase-invoices-full").insertMany(aggregate, function (err, res) {
        if (err) throw err;
      });
  }
  return aggregate;
};

async function purchase_invoices_parser(extracted){
   return extracted.map( x=>{
      return { 
          status_confirmed: x.Confirmed,
          cancel_status: x.CancelStatus,
          payment_group: x.PaymentGroupCode,
          confirmedAt: x.UpdateDate + "T"+ x.UpdateTime +".000Z",
          folio: x.DocEntry, 
          country: "MX", 
          identifier: x.NumAtCard ,   
          supplierIdentifier: x.FederalTaxID,
          payerIdentifier:"PODER_JUSTO_RFC", 
          issueDate: x.DocDate + "T"+ x.DocTime + ".000Z",
          invoiceType: "33", 
          amount: x.DocTotal,
          comments: x.Comments
    }});
}

recordRoutes.route("/sapb1_vendor_payments").get(async function (req, res) { 
  try{

    const cookie = await fetch_cookie();
    const extracted = await fetch_data_SAPB1(cookie, "PurchaseInvoices",10000);

    // const m = await purchase_invoices_parser(extracted);

    // write_file("pc-notes.json", JSON.stringify(extracted));

    res.send({invoices: "success"});

  } catch(e){
    console.log(e)
    res.send({e})
  }
});



module.exports = recordRoutes;