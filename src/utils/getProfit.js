function getProfit(price, rcCost, lbin) {
    const profitItem = {}
    if (price >= 1000000) {
        profitItem.RCProfit = ((lbin + rcCost) - price)
            - ((lbin + rcCost) * 0.02);
        profitItem.RCPP = (((lbin + rcCost - price)
            - ((lbin + rcCost) * 0.02)) / price) * 100;
        profitItem.snipeProfit = (lbin - price) - (lbin * 0.02)
        profitItem.snipePP = (lbin - price) - ((lbin * 0.02) / price) * 100
    } else {
        profitItem.RCProfit = ((lbin + rcCost) - price)
            - ((lbin + rcCost) * 0.01);
        profitItem.RCPP = ((((lbin + rcCost) - price)
            - ((lbin + rcCost) * 0.01)) / price) * 100;
        profitItem.snipeProfit = (lbin - price) - (lbin * 0.01)
        profitItem.snipePP = (lbin - price) - ((lbin * 0.01) / price) * 100
    }

    return profitItem
}

module.exports = {
    getProfit
}