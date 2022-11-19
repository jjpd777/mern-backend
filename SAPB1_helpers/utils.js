const dbo = require("../db/conn");
const axios = require('axios');
const fs = require('fs');
const write_file = require('./file_writer');


const sap_endpoint = true ? "https://10.10.10.4:50000/b1s/v1/" : "https://20.225.223.249:55000/b1s/v1/";
const sap_auth = sap_endpoint + "Login";
const body = { "CompanyDB": "PRUEBAS_PODER_JUSTO", "UserName": "pj_sistemas", "Password": "W4M2NS4y9h" };
const production_credentials = { "CompanyDB": "PODER_JUSTO", "UserName": "pj_administracion", "Password": "180788" };

function url_for_endpoint(object, n) {
    const NOTE_WHERE = 340500;

    const select_fields = 'NumAtCard, DocumentLines';
    const r = sap_endpoint + object + "?$filter=DocDate ge '2022-09-15'&$skip="+ String(n);
    // const r = sap_endpoint + object + "?$skip="+ String(341000+n) + '&$select='+ select_fields;
    // console.log(r);
    return r
    
};

async function fetch_cookie() {
    const c = await axios.post(sap_auth, production_credentials).then(r => r.headers["set-cookie"]);
    return { headers: { Accept: 'application/json', Cookie: c } }
};

async function write_table_mongoDB(mongo, data, table_title) {
    return await mongo.collection(table_title).insertMany(data, function (err, res) {
        if (err) throw err;
    });
};

function extract_suppliers (a){
    return a.filter( x  => x.CardType !=="cCustomer")
};

function parse_document_lines(w){
    return w.DocumentLines.map( x => {
        return { 
                item_description: x.ItemDescription,
                item_quantity : x.Quantity,
                item_price: x.Price,
                warehouse: x.WarehouseCode, 
                item_unit: x.MeasureUnit,
                ship_date: x.ShipDate
            }
    
    })
}

function purchase_orders_parser (x){
    return{
        card_code: x.CardCode,
        card_name: x.CardName,
        comments: x.Comments,
        fiscal_id: x.FederalTaxID,
        creation_date: x.CreationDate,
        updated_date: x.UpdateDate,
        due_date: x.DocDueDate,
        total_value: x.DocTotalSys,
        document_lines: parse_document_lines(x)
    }
}

function suppliers_parser(x){
       return { 
           cardCode: x.CardCode,
           card_name: x.CardName,
           supplierIdentifier: x.FederalTaxID,
           registered_date: x.ContactEmployees.CreateDate,
           current_account_balance: x.CurrentAccountBalance,
           open_delivery_notes_balance: x.OpenDeliveryNotesBalance,
           open_orders_balance: x.OpenOrdersBalance
     };
 };


function purchase_invoices_parser(x){
    if(x.U_AutFinanzas==='SI'){
        console.log(x.U_UDF_UUID, x.NumAtCard);
    }
       return { 
           supplier_name: x.CardName,
           card_number: x.NumAtCard,
           folio: x.DocEntry, 
           cancel_status: x.CancelStatus,
           fiscal_id: x.FederalTaxID,
           fiscal_ID_2: x.U_UDF_UUID,
           issue_date: x.DocDate + "&"+ x.DocTime ,
           due_date: x.DocDueDate,
           authorized_finance: x.U_AutFinanzas,
           credit_note: x.U_FactReferencia,
           comments_1: x.Comments,
           comments_2: x.NFRef
     };
 };

 function parse_function_write_xepelin(x){
    return {
        confirmedAt: x.DocDueDate + "T17:00:00.000Z",
        identifier: x.U_UDF_UUID,
        supplierIdentifier: x.FederalTaxID,
        payerIdentifier:"PJU190215RN2", 
        issueDate: x.DocDate + "T"+ x.DocTime + ".000Z",
        amount: x.DocTotal
   }
 };

 function parse_alternate_write_xepelin(x){
    return {
        authorized_finnance: x.U_AutFinanzas,
        confirmedAt: x.DocDueDate + "T17:00:00.000Z",
        identifier: x.U_UDF_UUID,
        supplierIdentifier: x.FederalTaxID,
        payerIdentifier:"PJU190215RN2", 
        issueDate: x.DocDate + "T"+ x.DocTime + ".000Z",
        amount: x.DocTotal
   }
 };

 function extract_sales_items( i , txn_id){
    return {
        txn: txn_id,
        item_code: i.ItemCode,
        issue_date: i.DocDate,
        issue_time: i.DocTime,
        due_date: i.DocDueDate,
        barcode: i.BarCode,
        item_description: i.ItemDescription,
        item_quantity: i.Quantity,
        ship_date: i.ShipDate,
        item_price: i.Price,
        item_discount: i.DiscountPercent,
        warehouse: i.WarehouseCode,
        tax_code: i.TaxCode,
        item_buy_price: i.GrossBuyPrice,
        item_gross_profit: i.GrossProfit
    }
};


module.exports = async function fetch_SAPB1_write_MONGO(table, table_title) {
    var counter = 0;

    let db_connect = dbo.getDb();
    const write_local = true;
    const cookie = await fetch_cookie();
    var petition_response = {data: {'odata.nextLink': true}}
    var aggregate = [];
    var missing_conf = [];

    while(!!petition_response.data['odata.nextLink']) {
        const endpoint = url_for_endpoint(table, counter);
        console.log("Fetching... ", endpoint)
        petition_response = await axios.get(endpoint, cookie).then( r => r);

        var buff = petition_response.data.value;

        if(table === "BusinessPartners"){
            buff = buff.filter( p =>  p.CardType !=="cCustomer");
            buff = buff.map( p => suppliers_parser(p));
        }
        else if( table=== "PurchaseOrders" ){
            buff = buff.map( p => purchase_orders_parser(p));
        }
        else if( table === "PurchaseInvoices" ){
            buff = buff.map( (p, ix )=> {
                ix ===0 && console.log(p.DocDate);
                p.U_AutFinanzas ==='SI' && console.log(p.DocNum, p.DocDate, p.DocDueDate, p.U_AutFinanzas);
                (p.FederalTaxID === 'VIF2003035Y7' || p.FederalTaxID === 'AAPF920121MW0' || p.FederalTaxID === 'MUCL870831UK3')
                && missing_conf.push( parse_alternate_write_xepelin(p))
                return p.U_AutFinanzas==='SI' && parse_function_write_xepelin(p)});
            buff = buff.filter( x=> !!x);
        }
        else if( table === "Invoices" ){
            var temporal = [];
            buff.map( p => {
                const txn_id = p.NumAtCard;
                console.log("This many items purchased: ", p.DocumentLines.length)
                p.DocumentLines.map( item_purchase => 
                    temporal.push( 
                        extract_sales_items( item_purchase, txn_id) 
                    ));
            });
            buff = temporal;
        };

        aggregate.push( ...buff );
        console.log( counter , " scrapper parser --", aggregate.length, " aggregate length");

        // const additional_condition = counter !== 0 && (counter % 10000 ===0 );

        // const check_local_write = additional_condition || (!petition_response.data['odata.nextLink']);
        const check_local_write = !petition_response.data['odata.nextLink'];

        if(check_local_write){
            missing_conf.map( xx => console.log(xx));
            await write_file(
                "./RawData/" + table_title+"purchase_invoices_PJ_"+ + String(aggregate.length)+".json", 
                JSON.stringify(aggregate)
            )

            await write_file(
                "./RawData/" + table_title+"general_scrapped_PJ_"+ + String(missing_conf.length)+".json", 
                JSON.stringify(missing_conf)
            )
            aggregate= [];
        };
        counter += 20;
    };
    return aggregate;
};

