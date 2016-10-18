var SlackBot = require('slackbots');

// create a bot
var bot = new SlackBot({
    token: 'xoxb-92380329216-OxPW3vLLhfsn7lFSplhRGAZD', // Add a bot https://my.slack.com/services/new/bot and put the token
    name: 'GOD'
});

var params = {
    icon_emoji: ':cat:'
};

exports.init = function() {

    bot.on('start', function() {
        // define channel, where bot exist. You can adjust it there https://my.slack.com/services
        bot.postMessageToChannel('general', 'meow!', params);
    });

    bot.on('message', function(data) {
        if(data.type === 'message') {
            if(data.text === 'hi') {
                bot.postMessageToChannel('general', 'funck you', params);
            }
        }
    });
};

exports.sendMessage = function(text, callback)
{
    bot.postMessageToChannel('general', text, params, function(err, res) {
        callback(err, res);
    });
};