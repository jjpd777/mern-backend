
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