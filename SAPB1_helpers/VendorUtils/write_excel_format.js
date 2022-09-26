const payment_days_converter = require('../../SAPB1_helpers/payments_days_converter');
const write_file = require('../file_writer');

const fs = require('fs');



function vendor_payments_parser(processed_json){
     const keys = Object.keys(processed_json);
     var result = [];
     keys.map( k => result.push( processed_json[k]));
     return result;
 };






module.exports = async function read_write_vendor_payments ( file_string ){
    let rawdata = fs.readFileSync('./Rawggy/vendor-payments-parsed-full.json');

    console.log(rawdata);
    let rd = JSON.parse(rawdata);
    const keys = Object.keys(rd);
    const result = vendor_payments_parser(rd);
    await write_file("./the-money-excel.json", JSON.stringify(result))
    console.log(typeof(student))
}