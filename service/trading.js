var sync = require('synchronize');
var tradinglib = require('../lib/trading');
var stocklistlib = require('../lib/stocklist');
var moment = require('moment');

exports.getTradingList = function(param, callback) {
    sync.fiber(function() {
        var result = [];
        var today = moment();
        var tradingList = sync.await(tradinglib.getTradingList(param, sync.defer()));
        if(param.type === 'favorite') {
            result = sync.await(stocklistlib.filterFavoriteStock(tradingList, sync.defer()));
        } else if(param.type === 'kosdaq' || param.type === 'kospi') {
            result = sync.await(stocklistlib.filterBestStock("20" + param.start, param.type, tradingList, sync.defer()));
        }
        
        return result;

    }, function(err, res) {
        callback(err, res);
    });
};

exports.findTrading = function(callback) {
    tradinglib.findTrading(callback);
};