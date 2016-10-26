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

//관심종목 trading list를 slack을 통해 전송한다.
new cronJob(global.configure.cron.SEND_TRADING_FAVORITE, function(){

	sync.fiber(function() {

		sync.await(stocklistlib.findBestStocks(sync.defer()));
		sync.await(tradinglib.findTrading(['best'], sync.defer()));
		sync.await(slackbotlib.sendRecommendStockData(bot, sync.defer()));

	}, function(err, result) {
		if(err) return console.log(err);
	});

},null, true, 'Asia/Seoul');

bot.on('message', function(data) {
	if(data.type === 'message') {
		if(data.text === 'hi') {
			bot.postMessageToChannel('general', 'funck you', params,function(err, res) {

			});
		}
	}
});