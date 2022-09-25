module.exports = function payment_days_converter(code){
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