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
var findTrading = [
    { time: global.configure.cron.FIND_TRADING_TIME.GRADE_1, grade: 1, type: 'best' },
    { time: global.configure.cron.FIND_TRADING_TIME.GRADE_2, grade: 2, type: 'best' },
    { time: global.configure.cron.FIND_TRADING_TIME.GRADE_3, grade: 3, type: 'best' },
    { time: global.configure.cron.FIND_TRADING_TIME.FAVORITE, type: 'favorite'}
];

new cronJob(global.configure.cron.FIND_TRADING_TIME.TIME, function(){
    var time = moment().format("mm");
    time = parseInt(time, 10);
    sync.fiber(function() {

        sync.await(stocklistService.findBestStocks(sync.defer()));
        findTrading.forEach(function(trading) {
            if(time % trading.time != 0 ) {
                return;
            }

            console.log('Cron Schedule', moment().format("HHmm"));
            var param = {
                type: trading.type,
                grade: trading.grade || 0
            };
            sync.await(tradingService.findTradingList(param, sync.defer()));
        });

    }, function(err, result) {
        if(err) return console.log(err);
    });
},null, true, 'Asia/Seoul');