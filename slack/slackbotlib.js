var SlackBot = require('slackbots');

// create a bot
var bot = new SlackBot({
    token: 'xoxb-95893489302-xDVVZ6ueOj9STBj7UHVaSyM6',
    name: '고명환'
});

var params = {
    icon_url: 'https://s3-us-west-2.amazonaws.com/slack-files2/avatar-temp/2016-10-26/95997872625_500b9996104fc07bb259.jpg'
};

bot.on('message', function(data) {
    if(data.type === 'message') {
        if(data.text === 'hi') {
            bot.postMessageToChannel('general', 'funck you', params,function(err, res) {

            });
        }
    }
});

exports.sendMessage = function(text, callback)
{
    bot.postMessageToChannel('general', text, params, function(err, res) {
        callback(err, res);
    });
};