var mongoose = require('mongoose');

exports.StockSchema = new mongoose.Schema({
    isu_nm: {type: String, require: true},
    isu_srt_cd: {type: String, require: true},
    isu_cdnm: {type:String, require:true},
    isu_cd: {type:String, require:true},
    market_name: {type:String}
}, {versionKey: false});

exports.FavoriteStockSchema = new mongoose.Schema( {
    isu_nm: {type:String, require:true}
}, {versionKey: false});

exports.ExceptionStockSchema = new mongoose.Schema( {
    isu_nm: {type:String, require:true}
}, {versionKey: false});

exports.BestStockSchema = new mongoose.Schema({
    date: {type:String, require: true},
    type: {type: String, require: true},
    list: {type: Array} //isu_nm
}, {versionKey: false});

exports.StockTrendSchema = new mongoose.Schema({
    isu_nm: {type:String, require:true},
    lastdate: {type:String},
    trendlist: {type: Array}
}, {versionKey: false});