/**
 * Created by LEE-DESKTOP on 2016-08-26.
 */

var sync = require('synchronize');
var tradinglib = require('./lib/trading');
var stocklistlib = require('./lib/stocklist');
var mongoose = require('mongoose');
var config = require('./config');
var tradingService = require('./service/trading');
var stocklistService = require('./service/stocklist');

config.init();

//db
mongoose.connect(global.configure.db.path);
console.log('start cron');

( function() {
    console.log('START MAIN TEST');
    sync.fiber(function () {

        sync.await(stocklistService.findBestStocks(sync.defer()));
        sync.await(tradingService.findTrading(['favorite'], sync.defer()));
        sync.await(tradingService.findTrading(['best'], sync.defer()));

    }, function (err, result) {
        if (err) return console.log(err);
    });
})();