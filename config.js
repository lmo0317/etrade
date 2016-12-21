/**
 * Created by LEE-DESKTOP on 2016-08-29.
 */
var yaml = require('yamljs');
var redis = require('node-redis');
var debuglib = require('./lib/debug');
var staticdata = require('./lib/staticdata');

exports.init = function() {
    global.configure = yaml.load('./default.config.yml');
    global.DB = {};
    global.program = require('commander');
    global.program
        .version('0.0.1')
        .option('--d, --develop', 'Develop')
        .parse(process.argv);

    staticdata.load(global.DB);
    global.REDIS = redis.createClient(configure.redis.port, configure.redis.path);

    if(global.program.develop) {
        debuglib.init();
    }
};