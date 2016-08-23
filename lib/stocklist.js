var superagent = require('superagent');
var request  = superagent.agent();
var sync = require('synchronize');
var fs = require('fs');

var stock = require('../schema/stock');
var mongoose = require('mongoose');
var Stock = mongoose.model('Stock', stock.StockSchema);

function sumCheckCode(value) {
    if(value > 9) {
        return value % 10 + parseInt(value / 10);
    } else {
        return value;
    }
}

function makeLastKey(isu_srt_cd) {
    var v1 = parseInt(isu_srt_cd[0]);
    var v2 = sumCheckCode(parseInt(isu_srt_cd[1]) * 2);
    var v3 = parseInt(isu_srt_cd[2]);
    var v4 = sumCheckCode(parseInt(isu_srt_cd[3]) * 2);
    var v5 = parseInt(isu_srt_cd[4]);
    var v6 = sumCheckCode(parseInt(isu_srt_cd[5]) * 2);
    var result = 20 + v1 + v2 + v3 + v4 + v5 + v6;
    result = result > 9 ? result % 10 : result;
    return result === 0 ? 0 : 10 - result;
}

exports.getStocklist = function(callback) {
    Stock.find({}, callback);
};

exports.getStock = function(code, callback) {
    Stock.find({'isu_srt_cd': code} , callback);
};

exports.addStock = function(stock, callback) {

    sync.fiber(function() {

        var result = sync.await(exports.getStock(stock.isu_srt_cd, sync.defer()));
        if(result.length !== 0) {
            throw 'this stock already exist';
        }

        stock['isu_cdnm'] = stock['isu_srt_cd'] + '/' + stock['isu_nm'];
        var isu_srt_cd = stock['isu_srt_cd'].substr(1,6);
        stock['isu_cd'] = 'KR7' + isu_srt_cd + '00' + makeLastKey(isu_srt_cd);
        var doc = new Stock(stock);
        sync.await(doc.save(sync.defer()));
        console.log(doc);

    }, callback);
};

exports.deleteStock = function(isu_srt_cd, callback) {
    Stock.remove({"isu_srt_cd": isu_srt_cd}, callback);
};