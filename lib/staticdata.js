/**
 * Created by LEE-DESKTOP on 2016-12-21.
 */

var fs = require('fs');
var sync = require('synchronize');

exports.load = function(DB) {
    DB.MANAGER_SETTING = JSON.parse(fs.readFileSync('./staticdata/manager_setting.json'));
};