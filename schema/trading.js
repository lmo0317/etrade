var mongoose = require('mongoose');

exports.TradingSchema = new mongoose.Schema({
    stocklist: {type:Array, require:true}, //종목 코드
    date: {type:String, require:true} //날짜와 시간
});