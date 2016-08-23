var tradinglib = require('../lib/trading');

exports.getTradingList = function(param, callback) {
    tradinglib.getTradingList(param, callback);
};

exports.findTrading = function(callback) {
    tradinglib.findTrading(callback);
};