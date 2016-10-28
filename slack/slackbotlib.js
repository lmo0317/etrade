/**
 * Created by minolee on 2016-10-26.
 */
var tradinglib = require('../lib/trading');
var tradingservice = require('../service/trading');
var sync = require('synchronize');
var moment = require('moment');

exports.channelIdToName = function(bot, id) {
	var channels = bot.getChannels();
	if ((typeof channels !== 'undefined')
		&& (typeof channels._value !== 'undefined')
		&& (typeof channels._value.channels !== 'undefined')) {
		channels = channels._value.channels;
		for (var i=0; i < channels.length; i++) {
			if (channels[i].id == id) {
				return channels[i].name;
			}
		}
	}
	return '';
};

exports.userIdToName = function(bot, id) {
	var users = bot.getUsers();
	if ((typeof users !== 'undefined')
		&& (users._value !== 'undefined')
		&& (users._value.members !== 'undefined')) {
		users = users._value.members;
		for (var i=0; i < users.length; i++ ) {
			if (users[i].id == id) {
				return users[i].name;
			}
		}
	}
	return '';
};

exports.sendMessage = function(bot, params, text, callback)
{
	bot.postMessageToChannel(params.channel, text, params, function(err, res) {
		callback(err, res);
	});
};

exports.sendRecommendStockData = function(bot, params, callback)
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
		sync.await(exports.sendMessage(bot, params, text, sync.defer()));

	}, function(err, res) { 
		callback(err, res);
	});
};
