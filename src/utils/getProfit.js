function getProfit(price, rcCost, lbin) {
    const profitItem = {}
    if (price >= 1000000) {
        profitItem.RCProfit = ((lbin + rcCost) - price)
            - ((lbin + rcCost) * 0.02);
        profitItem.RCPP = parseFloat(((profitItem.RCProfit * 100) / lbin).toFixed(1))
        profitItem.snipeProfit = (lbin - price) - (lbin * 0.02)
        profitItem.snipePP = parseFloat(((profitItem.snipeProfit * 100) / lbin).toFixed(1))
    } else {
        profitItem.RCProfit = ((lbin + rcCost) - price)
            - ((lbin + rcCost) * 0.01);
        profitItem.RCPP = parseFloat(((profitItem.RCProfit * 100) / lbin).toFixed(1))
        profitItem.snipeProfit = (lbin - price) - (lbin * 0.01)
        profitItem.snipePP = parseFloat(((profitItem.snipeProfit * 100) / lbin).toFixed(1))
    }

    return profitItem
}

module.exports = {
    getProfit
}