/**
 * Created by minolee on 2017-05-12.
 */

var mongoose = require('mongoose');
exports.LogSchema = new mongoose.Schema({
    connection: {type: Number, require:true, default:0},
}, {versionKey: false});