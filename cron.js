/**
 * Created by LEE-DESKTOP on 2016-08-26.
 */

var cronJob = require('cron').CronJob;
var fs = require('fs');
var sync = require('synchronize');
var moment = require('moment');
var mongoose = require('mongoose');
var config = require('./config');
var tradingService = require('./service/trading');
var stocklistService = require('./service/stocklist');

config.init();

//db
mongoose.connect(global.configure.db.path);
console.log('Start Cron');

//find best stock
var findBestTrading = [{ time: global.configure.cron.FIND_TRADING_BEST_TIME.GRADE_1, grade: 1 },
                        { time: global.configure.cron.FIND_TRADING_BEST_TIME.GRADE_2, grade: 2 },
                        { time: global.configure.cron.FIND_TRADING_BEST_TIME.GRADE_3, grade: 3 }];

findBestTrading.forEach(function(trading) {
    new cronJob(trading.time, function(){
        console.log('Cron Schedule Best Stock', moment().format("YYYYMMDDHHmm"));
        sync.fiber(function() {

            var param = {
                type: 'best',
                grade: trading.grade
            };

            sync.await(stocklistService.findBestStocks(sync.defer()));
            sync.await(tradingService.findTradingList(param, sync.defer()));

        }, function(err, result) {
            if(err) return console.log(err);
        });

    },null, true, 'Asia/Seoul');
});

//find favorite stock
new cronJob(global.configure.cron.FIND_TRADING_FAVORITE, function(){

    console.log('Cron Schedule Favorite Stock', moment().format("YYYYMMDDHHmm"));
    sync.fiber(function() {

        var param = {
            type: 'favorite'
        };

        sync.await(tradingService.findTradingList(param, sync.defer()));

    }, function(err, result) {
        if(err) return console.log(err);
    });

},null, true, 'Asia/Seoul');