// /(.*)\[(V|IV|III|II|I)]/gm

const regex = /(.*)\[(V|VI)]/gm;
const str = `
Enderslayer [VI]
Smite [VI]: Revenant Horror Drop
Critical [VI]: Sven Packmaster Drop
Bane of Arthropods [VI]: Tarantula Broodfather Drop
Lifesteal [IV]: Purchasable from the Fear Mongerer's shop for 1.5 million coins and 32 purple candy.
Vampirism [VI]: Attained as a reward for being in the top 250 during the Spooky Festival.
Experience [IV]
Luck [VI]
Looting [IV]`
let m

let enchants = {}

function char_to_int(c) {
    if (c === "VI") {
        return 6
    } else if (c === "I") {
        return 1
    } else if (c === "II") {
        return 2
    } else if (c === "III") {
        return 3
    } else if (c === "IV") {
        return 4
    } else if (c === "V") {
        return 5
    }
}

while ((m = regex.exec(str)) !== null) {
    // This is necessary to avoid infinite loops with zero-width matches
    if (m.index === regex.lastIndex) {
        regex.lastIndex++;
    }

    // The result can be accessed through the `m`-variable.
    let currentEnch
    m.forEach((match, groupIndex) => {
        if (groupIndex === 1) {
            currentEnch = `"${match.trim().replace(" ", "_").toLowerCase()}"`
        } else if (groupIndex === 2) {
            enchants[currentEnch] = char_to_int(match)
        }
    });
}

console.log(enchants)