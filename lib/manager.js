/**
 * Created by LEE-DESKTOP on 2016-12-16.
 */
var superagent = require('superagent');
var sync = require('synchronize');
var fs = require('fs');
var manager = require('../schema/manager');
var mongoose = require('mongoose');
var ManagerSetting = mongoose.model('Manager', manager.ManagerSettingSchema);

exports.getManagerSetting = function(callback) {
    ManagerSetting.findOne({}, function(err, res) {
        var result = res;
        if(!result) {
            result = DB.MANAGER_SETTING;
        }
        callback(err, result);
    });
};

exports.setManagerSetting = function(setting, callback) {

    sync.fiber(function() {

        var managerSetting = sync.await(ManagerSetting.findOne({}, sync.defer()));
        if(!managerSetting) {
            //manager setting 비어 있을경우 static data에서 로딩해서 저장한다.
            var doc = new ManagerSetting(DB.MANAGER_SETTING);
            sync.await(doc.save(sync.defer()));
            return;
        }

        managerSetting.cron = setting.cron;
        sync.await(managerSetting.save(sync.defer()));

    }, function(err, result) {
        callback(err, result);
    });
};