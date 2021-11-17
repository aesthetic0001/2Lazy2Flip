const config = require("../../config.json")

function getRawCraft(item, cachedBzData, lbins) {
    let price = 0
    const ignoreMatch = Object.keys(config.filters.rawCraftIgnoreEnchants).find((key) => {
        if (item.itemData.id.includes(key)) return true
    })
    if (item.auctionData.lbin < config.nec.minPriceForRawcraft) return 0
    let isInIgnore = ignoreMatch ? ignoreMatch : false
    if (item.itemData.enchants && !item.itemData.id.includes(";")) {
        for (const enchant of Object.keys(item.itemData.enchants)) {
            const degree = item.itemData.enchants[enchant]
            const googEnchant = typeof config.filters.googEnchants[enchant] === "number" ? degree >= config.filters.googEnchants[enchant] : false
            if (isInIgnore) {
                const enchantMinValue = config.filters.rawCraftIgnoreEnchants[ignoreMatch][enchant]
                if (enchantMinValue >= degree) continue
            }
            if (googEnchant) {
                price += lbins[`${enchant.toUpperCase()};${degree.toString()}`] ? lbins[`${enchant.toUpperCase()};${degree.toString()}`].lbin * 0.5 : 0
            }
        }
    }
    if (item.itemData.aow) {
        price += lbins["THE_ART_OF_WAR"] * 0.3
    }
    if (item.itemData.recomb && (item.auctionData.category === "weapon" || item.auctionData.category === "armor" || item.auctionData.category === "accessories")) {
        price += cachedBzData["RECOMBOBULATOR_3000"] * 0.5
    }
    price += (item.itemData.hpbs ? item.itemData.hpbs : 0) * cachedBzData["HOT_POTATO_BOOK"] * 0.05
    // NOBODY CARES ABOUT FUMINGS OML
    price += (item.itemData.fpbs ? item.itemData.fpbs : 0) * cachedBzData["FUMING_POTATO_BOOK"] * 0.1

    return price
}

module.exports = {
    getRawCraft
}