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
 };

 function extract_credit_note(x){
     return{
         supplier: x.CardName,
         supplier_card: x.NumAtCard,
         uuid: x.U_UDF_UUID ? x.U_UDF_UUID : "- / -",
         payment_terms: payment_days_converter(x.PaymentGroupCode),
         doc_date: x.DocDate,
         doc_due_date: x.DocDueDate,
         card_code: x.CardCode,
         total: x.DocTotal,
         tax_code: x.TaxCode,
         comments: x.Comments,
         memo: x.JournalMemo
     }
 };

 

 module.exports =  async function purchase_credit_notes(list_cn){
    const r = list_cn.map( cn=> extract_credit_note(cn));
    await write_file("credit-notes-clean.json" , JSON.stringify(r))
    return [];
};
