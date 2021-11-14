const config = require("../../config.json")

function getRawCraft(item, cachedBzData, lbins) {
    let price = 0
    const ignoreMatch = Object.keys(config.nec.rawCraftIgnores).find((key) => {
        if (item.itemData.id.includes(key)) return true
    })
    let isInIgnore = ignoreMatch ? ignoreMatch : false
    if (item.itemData.enchants && !item.itemData.id.includes(";")) {
        for (const enchant of Object.keys(item.itemData.enchants)) {
            const degree = item.itemData.enchants[enchant]
            if (isInIgnore) {
                if (config.nec.rawCraftIgnores[ignoreMatch].includes(enchant)) continue
            }
            if (degree >= 5 || enchant.startsWith("ultimate")) {
                price += lbins[`${enchant.toUpperCase()};${degree.toString()}`] ? lbins[`${enchant.toUpperCase()};${degree.toString()}`].lbin : 0
            }
        }
    }
    if (item.itemData.aow) {
        price += lbins["THE_ART_OF_WAR"] * 0.7
    }
    if (item.itemData.recomb && (item.auctionData.category === "weapon" || item.auctionData.category === "armor" || item.auctionData.category === "accessories")) {
        price += cachedBzData["RECOMBOBULATOR_3000"] * 0.7
    }
    price += (item.itemData.hpbs ? item.itemData.hpbs : 0) * cachedBzData["HOT_POTATO_BOOK"] * 0.7
    price += (item.itemData.fpbs ? item.itemData.fpbs : 0) * cachedBzData["FUMING_POTATO_BOOK"] * 0.7

    return price
}

module.exports = {
    getRawCraft
}