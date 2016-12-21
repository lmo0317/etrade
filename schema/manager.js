/**
 * Created by LEE-DESKTOP on 2016-09-03.
 */

var mongoose = require('mongoose');
exports.ManagerSettingSchema = new mongoose.Schema({
    cron: {type:Object}
}, {versionKey: false});