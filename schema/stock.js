var mongoose = require('mongoose');

exports.StockSchema = new mongoose.Schema({
    isu_nm : {type: String, require: true},
    isu_srt_cd : {type: String, require: true},
    isu_cdnm: {type:String, require:true},
    isu_cd: {type:String, require:true}
});