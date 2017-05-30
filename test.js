/**
 * Created by LEE-DESKTOP on 2016-08-26.
 */

var sync = require('synchronize');
var tradinglib = require('./lib/trading');
var mongoose = require('mongoose');
var config = require('./config');
var tradingService = require('./service/trading');
var stocklistlib = require('./lib/stocklist');

config.init();

//db
mongoose.connect(global.configure.db.path);
console.log('start cron');

( function() {
    console.log('START MAIN TEST');
    sync.fiber(function () {

        /**
         * find trading test
         */
        var param = {};
        sync.await(stocklistlib.findBestStocks(sync.defer()));

        param.type = 'favorite';
        sync.await(tradingService.findTradingList(param, sync.defer()));

        param.type = 'best';
        param.grade = 1;
        sync.await(tradingService.findTradingList(param, sync.defer()));

    }, function (err, result) {
        if (err) return console.log(err);
    });
})();