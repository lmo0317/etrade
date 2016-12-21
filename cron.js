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
var managerService = require('./service/manager');

config.init();

//db
mongoose.connect(global.configure.db.path);
console.log('Start Cron');

function makeCron() {

    new cronJob(global.configure.cron.FIND_TRADING_TIME.TIME, function(){

        var time = moment().format("mm");
        time = parseInt(time, 10);
        sync.fiber(function() {

            var managerSetting = sync.await(managerService.getManagerSetting(sync.defer()));
            var findTrading = [
                { time: managerSetting.cron.grade[1], grade: 1, type: 'best' },
                { time: managerSetting.cron.grade[2], grade: 2, type: 'best' },
                { time: managerSetting.cron.grade[3], grade: 3, type: 'best' },
                { time: managerSetting.cron.favorite, type: 'favorite'}
            ];

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
}

makeCron();
