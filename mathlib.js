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


function shuffleArray(array) {
    var m = array.length, t, i;

    // While there remain elements to shuffle…
    while (m) {

        // Pick a remaining element…
        i = Math.floor(Math.random() * m--);

        // And swap it with the current element.
        t = array[m];
        array[m] = array[i];
        array[i] = t;
    }

    return array;
}

module.exports.checksum = checksum;
module.exports.getRandomInt = getRandomInt;
module.exports.shuffleArray = shuffleArray;
