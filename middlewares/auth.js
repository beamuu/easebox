const colors = require('colors')

var ACODE = null;

exports.setACODE = function(_acode) {
    ACODE = _acode
    console.log(`Access code has been set to ${colors.yellow(ACODE)}, ${colors.red('Do not shared with others!')}`)
}
exports.authMiddleWare = function (req,res,next) {
    var target = null;
    try {
        target = parseInt(req.headers.acode)
    }
    catch (err) {
        res.sendStatus(401)
    }
    if (target !== ACODE) return res.sendStatus(401)
    next()
}
exports.getACODE = function() {
    return ACODE
}