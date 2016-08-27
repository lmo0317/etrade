var mongoose = require('mongoose');

exports.TradingSchema = new mongoose.Schema({
    date: {type:String, require:true},
    isu_nm: {type:String, require:true},
    isu_srt_cd: {type:String, require:true},
    trade:  {type: mongoose.Schema.Types.Mixed}
});