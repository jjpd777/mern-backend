const payment_days_converter = require('../SAPB1_helpers/payments_days_converter');
const write_file = require('./file_writer');

const fs = require('fs');

function phones_extractor( x ){
    const p_1= [x.ContactPerson, x.Phone1, x.Phone2, x.EmailAddress];
    const employee = x.ContactEmployees['0'];
    var arr = [...p_1];

    if(employee){
        const p_2 = [employee.Phone1, employee.Phone2, employee.MobilePhone, employee.E_mail];
        arr.push(...p_2);
    }
    const res = arr.filter( n=> n);
    return res.join()
}

function suppliers_parser(x){
       return { 
           cardCode: x.CardCode,
           card_name: x.CardName,
           supplierIdentifier: x.FederalTaxID,
           registered_date: x.ContactEmployees.CreateDate,
           invoiceType: x.VatGroupLatinAmerica, 
           payment_terms: payment_days_converter(x.PayTermsGrpCode),
           contact: phones_extractor(x),
           current_account_balance: x.CurrentAccountBalance,
           open_delivery_notes_balance: x.OpenDeliveryNotesBalance,
           open_orders_balance: x.OpenOrdersBalance
     };
 };


function rewrite_dates(a){
}





module.exports = async function read_file ( file_string ){
    let rawdata = fs.readFileSync('./Rawggy/full_suppliers.json');
    let rd = JSON.parse(rawdata);
    const write_data = rd.map( x=> suppliers_parser(x));
    write_file("./clean-suppliers-parsed.json", JSON.stringify(write_data))
    console.log(typeof(student))
}