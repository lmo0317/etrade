/**
 * Created by LEE-DESKTOP on 2016-08-29.
 */
var yaml = require('yamljs');
//var slackbotlib = require('./slack/slackbotlib');

exports.init = function() {
    global.configure = yaml.load('./default.config.yml')
    global.DB = {};
    global.program = require('commander');
    global.program
        .version('0.0.1')
        .option('--d, --develop', 'Develop')
        .parse(process.argv);

    if(global.program.develop) {
        global.configure.cron.FIND_TRADING = '30 */10 * * * *';
    }

    //slackbotlib.init();
};