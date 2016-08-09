var yaml = require('yamljs');
var fs = require('fs');
var sync = require('synchronize');
global.configure = yaml.load('./default.config.yml');
global.DB = {};

exports.delegate = function(app, callback)
{
    callback(null,null);
};

