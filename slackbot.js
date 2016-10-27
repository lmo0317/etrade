var cronJob = require('cron').CronJob;
var fs = require('fs');
var sync = require('synchronize');
var moment = require('moment');
var tradinglib = require('./lib/trading');
var stocklistlib = require('./lib/stocklist');
var mongoose = require('mongoose');
var util = require('./lib/util');
var config = require('./config');
var SlackBot = require('slackbots');
var slackbotlib = require('./slack/slackbotlib');
var jsonloader = require('jsonloader');

var slacktoken = require('./slacktoken.json');

//초기화
config.init();

//db
mongoose.connect(global.configure.db.path);

//development setting
if(global.program.develop) {
	global.configure.cron.SEND_TRADING_FAVORITE = '0 * * * * *';
}

// create a bot
var bot = new SlackBot({
	name: '고명환',
	token: slacktoken.token
});

// send aprameter
var params = {
	icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/avatar-temp/2016-10-26/95997872625_500b9996104fc07bb259.jpg'
};

//관심종목 trading list를 slack을 통해 전송한다.
new cronJob(global.configure.cron.SEND_TRADING_FAVORITE, function(){
	//특정 시간마다 실행 되는 크론
	/*
	sync.fiber(function() {

		//sync.await(stocklistlib.findBestStocks(sync.defer()));
		//sync.await(tradinglib.findTrading(['best'], sync.defer()));
		//params.channel = 'favorite';
		//sync.await(slackbotlib.sendRecommendStockData(bot, params, sync.defer()));

	}, function(err, result) {
		if(err) return console.log(err);
	});
	*/
	console.log('slack cron');

},null, true, 'Asia/Seoul');

bot.on('message', function(data) {
	if(data.type === 'message') {

		sync.fiber(function() {

			var channelName = slackbotlib.channelIdToName(bot, data.channel);
			var userName = slackbotlib.userIdToName(bot, data.user);

			if(data.text === 'hi') {
				bot.postMessageToChannel(channelName, 'funck you', params,function(err, res) {

				});
			} else if(data.text === '관심종목') {

				sync.await(tradinglib.findTrading(['favorite'], sync.defer()));
				params.channel = 'favorite';
				slackbotlib.sendRecommendStockData(bot, params, function(err, res) {
					console.log('comple favorite send');
				});
			}

		}, function(err, res) {
			console.log('message send complete');
		});
	}
});