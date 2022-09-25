const write_file = require('./file_writer')



 function payment_days_converter(code){
     const dict = {
        "-1": "8",
        "15": "2",
        "18": "20",
        "19": "21",
        "12": "45",
        "24": "26",
        "8": "consignacion",
        "14": "none",
        "13": "28",
        "16" : "contraentrega",
        "17" : "anticipo",
        "9" : "30",
        "25" : "35",
        "20" : "40",
        "21" : "60",
        "23" : "10",
        "1" : "contado",
        "22" : "14",
        "10" : "7",
        "11" : "15",
    };
    return dict[String(code)]
 }

function extract_purchase_orders(x){
       return { 
           status_confirmed: x.Confirmed,
           cancel_status: x.CancelStatus,
           payment_terms: payment_days_converter(x.PaymentGroupCode),
           confirmedAt: x.UpdateDate + "T"+ x.UpdateTime +".000Z",
           folio: x.DocEntry, 
           country: "MX", 
           identifier: x.NumAtCard ,   
           supplierIdentifier: x.FederalTaxID,
           payerIdentifier:"PODER_JUSTO_RFC", 
           issueDate: x.DocDate + "T"+ x.DocTime + ".000Z",
           invoiceType: "IVAA16", 
           amount: x.DocTotal,
           comments_1: x.Comments,
           comments_2: x.NFRef
     };
 };


 module.exports =  async function purchase_orders(list_documents){
    const keys = Object.keys(list_documents);
    const response = keys.map( k=> extract_purchase_orders(list_cn[k]));
    return response;
};