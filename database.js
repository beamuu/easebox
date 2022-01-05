const level = require('level')
exports.db = level('./db', { valueEncoding: 'json' })