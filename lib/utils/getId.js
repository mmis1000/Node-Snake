module.exports = function getId(length) {
    if (arguments.length === 0) length = 8;
    var charSet = "0123456789abcdef".split("");
    var res = "";
    while (res.length < length) {
        res += charSet[Math.floor(charSet.length * Math.random())];
    }
    return res;
}