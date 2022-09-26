
const write_file = require('./file_writer');
const dbo = require("../db/conn");
const axios = require('axios');




const sap_endpoint = true ? "https://10.10.10.4:50000/b1s/v1/" : "https://20.225.223.249:55000/b1s/v1/";
const sap_auth = sap_endpoint + "Login";
const body = { "CompanyDB": "PRUEBAS_PODER_JUSTO", "UserName": "pj_sistemas", "Password": "W4M2NS4y9h" };

function url_for_endpoint(object, n) {
    return sap_endpoint + object + "?$skip=" + String(n);
};

async function fetch_cookie() {
    const c = await axios.post(sap_auth, body).then(r => r.headers["set-cookie"]);
    return { headers: { Accept: 'application/json', Cookie: c } }
};


const fs = require('fs');


//  const res = {
//      "x.CardCode": {
//          supplier_name: "x.CardName",
//          supplier_card: "x.CardCode",
//          valid_payments: 0,
//          invalid_payments: 0,
//          total_paid_sum: 0,
//          bank_accounts: [],
//          summary: [{ 
//              card_name: "sdfasdf", 
//              cancel_status: "x.Cancelled"
//              card_code: "dfsd", doc_date: "44", 
//              doc_due_date: " df"}]

//      }
//  };

 function parse_batch_20(cummulative_dictionary, new_invoices, supplier_dict){
     new_invoices.map( invoice =>{
         const payment_t = supplier_dict[invoice.CardCode] ? supplier_dict[invoice.CardCode].supplier_terms : "XXXXXXX";
         const invoice_valid = invoice.Cancelled === "tNO";

         const supplier_record = cummulative_dictionary[invoice.CardCode];
         console.log(payment_t)

         if(!supplier_record){
                cummulative_dictionary[invoice.CardCode]={
                    supplier_name: invoice.CardName,
                    supplier_card: invoice.CardCode,
                    valid_payments: invoice_valid ? 1: 0,
                    invalid_payments: invoice_valid ? 0: 1,
                    payment_terms: payment_t,
                    
                    total_paid_sum: invoice_valid ? invoice.TransferSum : 0,
                    total_invalid_paid_sum: !invoice_valid ? invoice.TransferSum : 0

                }
             }else{
                
                cummulative_dictionary[invoice.CardCode]={
                    supplier_name: supplier_record.supplier_name,
                    supplier_card: supplier_record.supplier_card,
                    payment_terms: payment_t,
                    valid_payments: invoice_valid ? supplier_record.valid_payments +1 : supplier_record.valid_payments,
                    invalid_payments: !invoice_valid ? supplier_record.invalid_payments +1 : supplier_record.invalid_payments,

                    total_paid_sum: invoice_valid ? supplier_record.total_paid_sum + invoice.TransferSum : supplier_record.total_paid_sum,
                    total_invalid_paid_sum: !invoice_valid ?  supplier_record.total_invalid_paid_sum + invoice.TransferSum : supplier_record.total_invalid_paid_sum,

                }
             }
         });
              return cummulative_dictionary;

     }


// async function supplier_terms_dictionary(all_suppliers){
//     var dict = {};
//      all_suppliers.map( supplier => dict[supplier.cardCode]= { supplier_card: supplier.cardCode, supplier_terms: supplier.payment_terms});
//      console.log(dict)
//     await write_file("terms-dictionary-ffs.json" , JSON.stringify(supplier_dictionary))

//      return dict;
// }




module.exports = async function fetch_SAPB1_write_LOCAL(table) {
    var counter = 0;
    const cookie = await fetch_cookie();
    let supplier_raw= await fs.readFileSync('./Rawggy/terms-dictionary-ffs.json');
    let supplier_dictionary = JSON.parse(supplier_raw);



    // console.log(supplier_dictionary)
    var petition_response = {data: {'odata.nextLink': true}}
    var result ={};

    while(!!petition_response.data['odata.nextLink']) {
        const endpoint = url_for_endpoint(table, counter);
        petition_response = await axios.get(endpoint, cookie).then( r => r);
        result = parse_batch_20(result, petition_response.data.value, supplier_dictionary);     
        counter += 20;
        console.log("counter is at: ", counter);
        if(counter%200 === 0){
            console.log(result);
        }
        if(!petition_response.data['odata.nextLink']){
            write_file(
                "./RawData/" + "clean-fresh-vp-excel" + "-" + String(counter)+".json", 
                JSON.stringify(result)
            )
        }
    };
     
    return "all good mfq";
};

