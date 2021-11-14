const {getLBIN} = require("./getLBIN");
const config = require("../../config.json ")

function getRawCraft(item, cachedBzData, lbins, aowPrice) {
    let price = 0
    const ignoreMatch = Object.keys(config.nec.rawCraftIgnores).find((key) => {
        if (item.id.includes(key)) return true
    })
    let isInIgnore = ignoreMatch ? ignoreMatch : false
    price += item.lbin
    if (item.enchants && !item.id.includes(";")) {
        for (const enchant of Object.keys(item.enchants)) {
            const degree = item.enchants[enchant]
            if (isInIgnore) {
                if (config.nec.rawCraftIgnores[ignoreMatch].includes(enchant)) continue
            }
            if (degree >= 5 || enchant.startsWith("ultimate")) {
                price += lbins[`${enchant.toUpperCase()};${degree.toString()}`] ? lbins[`${enchant.toUpperCase()};${degree.toString()}`].lbin : 0
            }
        }
    }
    if (item.aow) {
        price += aowPrice * 0.7
    }
    if (item.recomb && (item.category === "weapon" || item.category === "armor" || item.category === "accessories")) {
        price += cachedBzData["RECOMBOBULATOR_3000"] * 0.7
    }
    price += (item.hpbs ? item.hpbs : 0) * cachedBzData["HOT_POTATO_BOOK"]
    price += (item.fpbs ? item.fpbs : 0) * cachedBzData["FUMING_POTATO_BOOK"] * 0.7

    return price
}

module.exports = {
    getRawCraft
}