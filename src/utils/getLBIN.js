function getLBIN(itemID, recomb, rarity, cachedData) {
    if (recomb) {
        const correctRarityIndex = Object.keys(cachedData).map(function (o) {
            return o;
        }).indexOf(rarity) - 1
        const correctRarity = Object.keys(cachedData)[correctRarityIndex]
        if (cachedData[correctRarity].find((ah) => ah.id === itemID)) {
            return cachedData[correctRarity].find((ah) => ah.id === itemID).price
        } else {
            return 0
        }
    } else {
        if (cachedData[rarity].find((ah) => ah.id === itemID)) {
            return cachedData[rarity].find((ah) => ah.id === itemID).price
        } else {
            return 0
        }
    }
}

module.exports = {
    getLBIN
}