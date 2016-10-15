/**
 * Created by LEE-DESKTOP on 2016-08-26.
 */

var cronJob = require('cron').CronJob;
var fs = require('fs')
var sync = require('synchronize');
var moment = require('moment');
var tradinglib = require('./lib/trading');
var stocklistlib = require('./lib/stocklist');
var yaml = require('yamljs');
var mongoose = require('mongoose');
var util = require('./lib/util');
var config = require('./config');

config.init();

//db
mongoose.connect(global.configure.db.path);
console.log('start cron');

( function() {
    console.log('START MAIN TEST');
    sync.fiber(function () {

        sync.await(stocklistlib.findTop100Stocks(sync.defer()));
        sync.await(tradinglib.findTrading(sync.defer()));

    }, function (err, result) {
        if (err) return console.log(err);
    });
})();