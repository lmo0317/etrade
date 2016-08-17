var tradinglib = require('../lib/trading');

exports.getTrading = function(param, callback) {
    tradinglib.getTrading(param, callback);
};

exports.findTrading = function(callback) {
    tradinglib.findTrading(callback);
};