/**
 * Created by LEE-DESKTOP on 2016-12-16.
 */

var managerlib = require('../lib/manager');

exports.getManagerSetting = function(callback) {
    managerlib.getManagerSetting(callback);
};

exports.setManagerSetting = function(setting, callback) {
    managerlib.setManagerSetting(setting, callback);
};