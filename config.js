/**
 * Created by LEE-DESKTOP on 2016-08-29.
 */
var yaml = require('yamljs');

exports.init = function() {
    global.configure = yaml.load('./default.config.yml')
    global.DB = {};
    global.program = require('commander');
    global.program
        .version('0.0.1')
        .option('--d, --develop', 'Develop')
        .parse(process.argv);
};