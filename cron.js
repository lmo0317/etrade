/**
 * Created by LEE-DESKTOP on 2016-08-26.
 */

var cronJob = require('cron').CronJob;
var fs = require('fs')
var sync = require('synchronize');
var moment = require('moment');
var tradinglib = require('./lib/trading');
var yaml = require('yamljs');
var mongoose = require('mongoose');
var util = require('./lib/util');

global.configure = yaml.load('./default.config.yml')
global.DB = {};
global.program = require('commander');
global.program
    .version('0.0.1')
    .option('--d, --develop', 'Develop')
    .parse(process.argv);

//db
mongoose.connect(global.configure.db.path);

new cronJob(global.configure.cron.FIND_TRADING, function(){

    console.log('cron schedule', moment().format("YYYYMMDDHHmm"));
    sync.fiber(function() {

        sync.await(tradinglib.findTrading(sync.defer()));

    }, function(err, result) {
        if(err) return console.log(err);
        console.log('complete find trading');
    });

},null, true, 'Asia/Seoul');