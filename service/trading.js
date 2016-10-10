var sync = require('synchronize');
var tradinglib = require('../lib/trading');
var stocklistlib = require('../lib/stocklist');
var moment = require('moment');

exports.getTradingList = function(param, callback) {
    sync.fiber(function() {
        var result = [];
        var today = moment();

        var tradingList = sync.await(tradinglib.getTradingList(param, sync.defer()));

        if(param.favorite === 'true') {
            var trading = sync.await(stocklistlib.filterFavoriteStock(tradingList, sync.defer()));
            result = result.concat(trading);
        }

        if(param.best === 'true') {
            var trading = sync.await(stocklistlib.filterBestStock("20" + param.start, tradingList, sync.defer()));
            result = result.concat(trading);
        }

        return result;

    }, function(err, res) {
        callback(err, res);
    });
};

exports.findTrading = function(callback) {
    tradinglib.findTrading(callback);
};