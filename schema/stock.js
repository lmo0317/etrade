var mongoose = require('mongoose');

exports.StockSchema = new mongoose.Schema({
    isu_nm: {type: String, require: true},
    isu_srt_cd: {type: String, require: true},
    isu_cdnm: {type:String, require:true},
    isu_cd: {type:String, require:true},
    market_name: {type:String}
});

exports.FavoriteStockSchema = new mongoose.Schema( {
    isu_nm: {type:String, require:true}
});

exports.BestStockSchema = new mongoose.Schema({
    date: {type:String, require: true},
    list: {type: Array} //isu_nm
});