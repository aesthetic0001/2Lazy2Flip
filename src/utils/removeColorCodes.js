function strRemoveColorCodes (str) {
    return str.replace(/§./g, '')
}

module.exports = {
    strRemoveColorCodes
}