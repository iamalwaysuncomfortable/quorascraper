const crypto = require('crypto');

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function checksum(str, algorithm, encoding) {
    if (typeof(algorithm) === "undefined") throw "Hashsing Algorithm Must Be Defined";
    return crypto
        .createHash(algorithm)
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}

module.exports.checksum = checksum;
module.exports.getRandomInt = getRandomInt;