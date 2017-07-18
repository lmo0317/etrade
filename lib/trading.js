var superagent = require('superagent');
var request  = superagent.agent();
var sync = require('synchronize');
var fs = require('fs');
var stocklistlib = require('./stocklist');
var moment = require('moment');
var trading = require('../schema/trading');
var mongoose = require('mongoose');
var Trading = mongoose.model('Trading', trading.TradingSchema);
var utilLib = require('./util');

exports.getAutoAddRedisKey = function() {
    return "auto:add"
};

exports.addTrading = function(trading, buyInfo, memberlist, callback) {
    //var doc = new Trading(trading);
    sync.fiber(function() {
        var result = sync.await(Trading.findOne({date: trading.date, isu_srt_cd: trading.isu_srt_cd }, sync.defer()));
        if(!result) {
            //trading 없을경우 추가
            trading.buylist = [buyInfo];
            trading.memberlist = memberlist;
            var doc = new Trading(trading);
            sync.await(doc.save(sync.defer()));
        } else {
            var buylist = [];
            result.buylist.forEach(function(buy) {
                if(buy.time !== buyInfo.time) {
                    buylist.push(buy);
                }
            });
            buylist.push(buyInfo);
            result.buylist = buylist;
            result.memberlist = memberlist;
            sync.await(result.save(sync.defer()));
        }
    }, callback);
};

exports.getTradingList = function(param, callback) {
    var start = '20' + param.start;
    var end = '20' + param.start;
    Trading.find({date: {$gte:start, $lte:end}}, callback);
};

exports.getTrading = function(param, callback) {
    var start = '20' + param.start;
    var end = '20' + param.start;
    Trading.findOne({date: {$gte:start, $lte:end}, isu_nm: param.isu_nm}, callback);
};

exports.deleteTrading = function(date, isu_nm, callback) {
    Trading.remove({'date': date, 'isu_nm': isu_nm}, callback);
};

exports.removeTrading = function(param , callback) {
    sync.fiber(function() {
        var start = '20' + param.start;
        var end = '20' + param.start;
        var trading = sync.await(Trading.findOne({date: {$gte:start, $lte:end}, isu_nm: param.isu_nm}, sync.defer()));
        if(!trading) {
            return;
        }

        trading.removed = true;
        sync.await(trading.save(sync.defer()));

    }, function(err, result) {
        callback(err, result);
    });
};

exports.editTrading = function(param, callback) {
    sync.fiber(function() {
        var start = '20' + param.start;
        var end = '20' + param.start;
        var trading = sync.await(Trading.findOne({date: {$gte:start, $lte:end}, isu_nm: param.isu_nm}, sync.defer()));
        if(!trading) {
            return;
        }

        trading.grade = parseInt(param.grade);
        sync.await(trading.save(sync.defer()));

    }, function(err, result) {
        callback(err, result);
    });
};

exports.isHidden = function(index) {
    //HTS에서 제공하지 않은 숨겨진 멤버인지 검사한다.
    return !(index >= 0 && index <= 4);
};

function getAtutoAddValue(stock) {
    switch(stock.market_name) {
        case "KOSDAQ":
            return global.configure.autoadd.cosdaq;
        case "KOSPI":
            return global.configure.autoadd.cospi;
        default:
            return 0;
    }
}