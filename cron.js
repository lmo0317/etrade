/**
 * Created by LEE-DESKTOP on 2016-08-26.
 */

var cronJob = require('cron').CronJob;
var fs = require('fs')
var sync = require('synchronize');
var moment = require('moment');
var tradinglib = require('./lib/trading');
var stocklistlib = require('./lib/stocklist');
var mongoose = require('mongoose');
var util = require('./lib/util');
var config = require('./config');
var tradingService = require('./service/trading');

config.init();

//db
mongoose.connect(global.configure.db.path);
console.log('Start Cron');

//favorite
new cronJob(global.configure.cron.FIND_TRADING_BEST, function(){

    console.log('Cron Schedule Facorite Stock', moment().format("YYYYMMDDHHmm"));
    sync.fiber(function() {

        sync.await(stocklistlib.findBestStocks(sync.defer()));
        sync.await(tradinglib.findTrading(['best'], sync.defer()));

    }, function(err, result) {
        if(err) return console.log(err);
    });

},null, true, 'Asia/Seoul');

//best
new cronJob(global.configure.cron.FIND_TRADING_FAVORITE, function(){

    console.log('Cron Schedule Best Stock', moment().format("YYYYMMDDHHmm"));
    sync.fiber(function() {

        sync.await(tradinglib.findTrading(['favorite'], sync.defer()));

    }, function(err, result) {
        if(err) return console.log(err);
    });

},null, true, 'Asia/Seoul');