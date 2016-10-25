/**
 * Created by LEE-DESKTOP on 2016-08-26.
 */

var sync = require('synchronize');
var tradinglib = require('./lib/trading');
var stocklistlib = require('./lib/stocklist');
var mongoose = require('mongoose');
var config = require('./config');
var tradingService = require('./service/trading');

config.init();

//db
mongoose.connect(global.configure.db.path);
console.log('start cron');

( function() {
    console.log('START MAIN TEST');
    sync.fiber(function () {

        sync.await(stocklistlib.findBestStocks(sync.defer()));
        sync.await(tradinglib.findTrading(['favorite'], sync.defer()));
        sync.await(tradinglib.findTrading(['best'], sync.defer()));
        sync.await(tradingService.sendRecommendStockData(sync.defer()));

    }, function (err, result) {
        if (err) return console.log(err);
    });
})();