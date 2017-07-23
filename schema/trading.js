var mongoose = require('mongoose');

exports.TradingSchema = new mongoose.Schema({
    date: {type:String, require:true},
    isu_nm: {type:String, require:true},
    isu_srt_cd: {type:String, require:true},
    buylist: {type: Array},
    memberlist: {type: Array}
}, {versionKey: false});