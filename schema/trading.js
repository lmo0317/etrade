var mongoose = require('mongoose');

exports.TradingSchema = new mongoose.Schema({
    date: {type:String, require:true},
    isu_nm: {type:String, require:true},
    isu_cd: {type:String, require:true},
    trade: {type:Array}
});