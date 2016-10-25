var sync = require('synchronize');
var tradinglib = require('../lib/trading');
var stocklistlib = require('../lib/stocklist');
var moment = require('moment');
var slackbotlib = require('../slack/slackbotlib');

exports.getTradingList = function(param, callback) {
    sync.fiber(function() {
        var result = [];
        var tradingList = sync.await(tradinglib.getTradingList(param, sync.defer()));
        if(param.type === 'favorite') {
            result = sync.await(stocklistlib.filterFavoriteStock(tradingList, sync.defer()));
        } else if(param.type === 'kosdaq' || param.type === 'kospi') {
            result = sync.await(stocklistlib.filterBestStock("20" + param.start, param.type, tradingList, sync.defer()));
        }
        
        return result;

    }, function(err, res) {
        callback(err, res);
    });
};

exports.sendRecommendStockData = function(callback)
{
    sync.fiber(function() {
        //parameter setting
        var today = moment();
        var param = {
            start: today.format('YYMMDD'),
            type: 'favorite'
        };
        //관심 종목        
        var tradinglist = sync.await(exports.getTradingList(param, sync.defer()));
        
        //기타 추천 종목
        
        // Text 정렬
        var text = '추천 종목 \n' + tradinglib.makeSimpleText(tradinglist);
        
        //slack message 전송
        sync.await(slackbotlib.sendMessage(text, sync.defer()));

    }, function(err, res) {
        callback(err, res);
    });
};