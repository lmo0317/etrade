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

config.init();

//db
mongoose.connect(global.configure.db.path);
console.log('Start Cron');

function makeCron() {

    new cronJob(global.configure.cron.FIND_TRADING_TIME.TIME, function(){

        var time = timelib.getCurrentTime().format("mm");
        time = parseInt(time, 10);
        sync.fiber(function() {

            var managerSetting = DB.MANAGER_SETTING;
            var findTrading = [
                { time: managerSetting.cron.best,  type: 'best' },
                { time: managerSetting.cron.favorite, type: 'favorite'}
            ];

            sync.await(stocklistlib.findBestStocks(sync.defer()));
            findTrading.forEach(function(trading) {
                if(time % trading.time != 0 ) {
                    return;
                }

                var param = {
                    type: trading.type,
                };
                sync.await(tradingService.findTradingList(param, sync.defer()));
            });

        }, function(err, result) {
            if(err) return console.log(err);
        });
    },null, true, 'Asia/Seoul');
}

makeCron();
