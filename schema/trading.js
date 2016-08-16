var mongoose = require('mongoose');

exports.TradingSchema = new mongoose.Schema({
    isu_cd: {type:String, require:true}, //종목 코드
    date: {type:String, require:true},
    
});