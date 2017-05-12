/**
 * Created by minolee on 2017-05-13.
 */

var logslib = require('../lib/logs');

exports.addConnection = function(callback) {
    logslib.addConnection(callback);
};