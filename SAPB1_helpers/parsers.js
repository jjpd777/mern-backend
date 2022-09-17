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