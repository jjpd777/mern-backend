var axios = require('axios');

const sample_AP ={ 
  confirmedAt: "2022-06-03T00:00:00.000Z",
  folio: "9233", 
  country: "MX", 
  identifier: "96301260-7_82580320-7_33_2000",   
  supplierIdentifier: "92580320-7",
  payerIdentifier:"7630142C069-7", 
  issueDate: "2022-06-01T00:00:00.000Z", 
  invoiceType: "33", 
  amount: 20000.3
};

var data = JSON.stringify({
  query: `mutation MyMutation {
  batchCreateInvoice(invoices: 
  [
      { 
        confirmedAt: "2022-06-03T00:00:00.000Z",
        folio: "9233", 
        country: CL, 
        identifier: "96301260-7_82580320-7_33_2000",   
        supplierIdentifier: "92580320-7",
        payerIdentifier:"76301260KFKFK-7", 
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

var config = {
  method: 'post',
  url: 'https://ubx5pawdbrbynmkkv77xuqpn34.appsync-api.us-east-1.amazonaws.com/graphql',
  headers: { 
    'x-api-key': 'da2-fndbjqry4bbyrjenfs7t23ipde', 
    'Content-Type': 'application/json'
  },
  data : data
};

axios(config)
.then(function (response) {
    console.log(JSON.stringify(response));
    console.log("\\n\n\n")
})
.catch(function (error) {
  console.log(error);
});

const example = `[
    {
        key: "1",
        val: "el valor indicado"
    },
    {
        key: "2",
        val: "el valor indicado"
    }
]`;