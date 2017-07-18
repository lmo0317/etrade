/**
 * Created by LEE-DESKTOP on 2016-08-26.
 */

var cronJob = require('cron').CronJob;
var fs = require('fs');
var sync = require('synchronize');
var timelib = require('./lib/time');
var mongoose = require('mongoose');
var config = require('./config');
var tradingService = require('./service/trading');
var stocklistlib = require('./lib/stocklist');
var managerlib = require('./lib/manager');

config.init();

//db
mongoose.connect(global.configure.db.path);
console.log('Start Cron');

function makeCron() {

    new cronJob(global.configure.cron.FIND_TRADING_TIME.TIME, function(){

        var time = timelib.getCurrentTime().format("mm");
        time = parseInt(time, 10);
        sync.fiber(function() {

            var managerSetting = sync.await(managerlib.getManagerSetting(sync.defer()));
            var findTrading = [
                { time: managerSetting.cron.grade[1], grade: 1, type: 'best' },
                { time: managerSetting.cron.grade[2], grade: 2, type: 'best' },
                { time: managerSetting.cron.grade[3], grade: 3, type: 'best' },
                { time: managerSetting.cron.favorite, type: 'favorite'}
            ];

            sync.await(stocklistlib.findBestStocks(sync.defer()));
            findTrading.forEach(function(trading) {
                if(time % trading.time != 0 ) {
                    return;
                }

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
