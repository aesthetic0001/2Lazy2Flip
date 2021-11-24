function getProfit(price, rcCost, lbin) {
    const profitItem = {}
    if (price >= 1000000) {
        profitItem.RCProfit = ((lbin + rcCost) - price)
            - ((lbin + rcCost) * 0.02);
        profitItem.RCPP = (profitItem.RCProfit * 100) / lbin
        profitItem.snipeProfit = (lbin - price) - (lbin * 0.02)
        profitItem.snipePP = (profitItem.snipeProfit * 100) / lbin
    } else {
        profitItem.RCProfit = ((lbin + rcCost) - price)
            - ((lbin + rcCost) * 0.01);
        profitItem.RCPP = (profitItem.RCProfit * 100) / lbin
        profitItem.snipeProfit = (lbin - price) - (lbin * 0.01)
        profitItem.snipePP = (profitItem.snipeProfit * 100) / lbin
    }

    return profitItem
}

module.exports = {
    getProfit
}