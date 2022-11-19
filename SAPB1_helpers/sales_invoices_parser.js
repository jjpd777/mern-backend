

function extract_sales_items( i ){
    return {
        item_code: i.ItemCode,
        item_description: i.ItemDescription,
        item_quantity: i.Quantity,
        ship_date: i.ShipDate,
        item_price: i.Price,
        item_discount: i.DiscountPercent,
        warehouse: i.WarehouseCode,
        barcode: i.BarCode,
        tax_code: i.TaxCode,
        item_buy_price: i.GrossBuyPrice,
        item_gross_profit: i.GrossProfit
    }
};
