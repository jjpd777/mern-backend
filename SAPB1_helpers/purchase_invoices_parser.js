const payment_days_converter = require('./payments_days_converter');



function extract_purchase_invoices(x){
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



 module.exports =  async function purchase_invoices(list_documents){
    const keys = Object.keys(list_documents);
    return keys.map( k=> extract_purchase_invoices(list_documents[k]));

};