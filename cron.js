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
console.log('Start Cron');

new cronJob(global.configure.cron.FIND_TRADING, function(){

    console.log('Cron Schedule ', moment().format("YYYYMMDDHHmm"));
    sync.fiber(function() {

        sync.await(stocklistlib.findBestStocks(sync.defer()));
        sync.await(tradinglib.findTrading(sync.defer()));

    }, function(err, result) {
        if(err) return console.log(err);
    });

},null, true, 'Asia/Seoul');