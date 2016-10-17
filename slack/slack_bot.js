/**
 * Created by LEE-DESKTOP on 2016-10-18.
 */

var RtmClient = require('slack-client').RtmClient;
var WebClient = require('slack-client').WebClient;
var token = 'xoxb-92380329216-50LhCbJHgtFiJ8ssr9vLVR8N';

var web = new WebClient('');
var rtm = new RtmClient(token, {logLevel: 'error'});
rtm.start();

var RTM_EVENTS = require('slack-client').RTM_EVENTS;
rtm.on(RTM_EVENTS.MESSAGE, function (message) {
    var channel = message.channel;
    var user = message.user;
    var text = message.text;

    if (text == 'hello')
        web.chat.postMessage(channel, 'World!', {username: "noticebot"});
});