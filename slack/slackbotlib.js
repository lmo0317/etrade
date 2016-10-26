/**
 * Created by minolee on 2016-10-26.
 */
var tradinglib = require('../lib/trading');
var tradingservice = require('../service/trading');
var sync = require('synchronize');
var moment = require('moment');

// send aprameter
var params = {
	icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/avatar-temp/2016-10-26/95997872625_500b9996104fc07bb259.jpg'
};

exports.sendMessage = function(bot, text, callback)
{
	bot.postMessageToChannel('general', text, params, function(err, res) {
		callback(err, res);
	});
};

exports.sendRecommendStockData = function(bot, callback)
{
	sync.fiber(function() {
		//parameter setting
		var today = moment();
		var param = {
			start: today.format('YYMMDD'),
			type: 'favorite'
		};

		//관심 종목
		var list = sync.await(tradingservice.getTradingList(param, sync.defer()));

		//기타 추천 종목

		// Text 정렬
		var text = '<<<<< <<<<< 추천 종목 >>>>> >>>>> \n' + tradinglib.makeSimpleText(list);

		//slack message 전송
		sync.await(exports.sendMessage(bot, text, sync.defer()));

	}, function(err, res) { 
		callback(err, res);
	});
};
