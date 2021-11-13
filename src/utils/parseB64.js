const nbt = require("prismarine-nbt");

async function getParsed(encoded) {
    return new Promise((resolve) => {
        let buf = Buffer.from(encoded, 'base64');
        nbt.parse(buf, (err, dat) => {
            if (err) throw err;
            resolve(nbt.simplify(dat))
        });
    })
}

module.exports = {
    getParsed
}