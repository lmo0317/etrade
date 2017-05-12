/**
 * Created by minolee on 2017-05-13.
 */
var sync = require('synchronize');
var logs = require('../schema/logs');
var mongoose = require('mongoose');
var Log = mongoose.model('Logs', logs.LogSchema);

exports.addConnection = function(callback) {
    sync.fiber(function() {
        var result = sync.await(Log.findOne({ }, sync.defer()));
        if(!result) {
            var doc = new Log();
            sync.await(doc.save(sync.defer()));
            return;
        }

        result.connection++;
        sync.await(result.save(sync.defer()));
    }, callback);
};