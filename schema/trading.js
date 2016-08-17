var mongoose = require('mongoose');

exports.TradingSchema = new mongoose.Schema({
    isu_cd: {type:String, require:true}, //종목 코드
    date: {type:Date, require:true} //날짜와 시간
});