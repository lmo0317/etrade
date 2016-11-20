var superagent = require('superagent');
var request  = superagent.agent();
var sync = require('synchronize');
var fs = require('fs');
var stock = require('../schema/stock');
var otplib = require('./otp');
var moment = require('moment');
var tradinglib = require('./trading');
var debuglib = require('./debug');

var mongoose = require('mongoose');
var Stock = mongoose.model('Stock', stock.StockSchema);
var BestStock = mongoose.model('BestStock', stock.BestStockSchema);
var FavoriteStock = mongoose.model('FavoriteStock', stock.FavoriteStockSchema);
var ExceptionStock = mongoose.model('ExceptionStock', stock.ExceptionStockSchema);

exports.getStockList = function(callback) {
    Stock.find({}, callback);
};

exports.getStock = function(isu_nm, callback) {
    Stock.findOne({'isu_nm': isu_nm}, callback);
};

exports.addStock = function(isu_nm, callback) {

    sync.fiber(function() {

        var result = sync.await(exports.getStock(isu_nm, sync.defer()));
        if(result !== null) {
            //this stock already exist
            return;
        }

        var stockInfo = sync.await(exports.getStockCode(isu_nm, sync.defer()));

        var stock = {
            isu_nm: isu_nm,
            isu_srt_cd: stockInfo['short_code'],
            isu_cdnm: stockInfo['short_code'] + '/' + isu_nm,
            isu_cd: stockInfo['full_code'],
            market_name: stockInfo['marketName']
        };

        //isu_cd 생성 하는 과정
        /*
         stock['isu_cdnm'] = stock['isu_srt_cd'] + '/' + stock['isu_nm'];
         var isu_srt_cd = stock['isu_srt_cd'].substr(1,6);
         stock['isu_cd'] = 'KR7' + isu_srt_cd + '00' + makeLastKey(isu_srt_cd);
         var doc = new Stock(stock);
         */

        var doc = new Stock(stock);
        sync.await(doc.save(sync.defer()));
        return stock;

    }, callback);
};

exports.deleteStock = function(isu_srt_cd, callback) {
    Stock.remove({"isu_srt_cd": isu_srt_cd}, callback);
};

exports.getFavoriteStock = function(isu_nm, callback) {
    FavoriteStock.findOne({'isu_nm': isu_nm}, callback)
};

exports.getFavoriteStockList = function(callback) {
    FavoriteStock.find({}, callback);
};

exports.addFavoriteStock = function(isu_nm, callback) {
    sync.fiber(function() {

        //isu_nm에 해당하는 stock이 있는지 검사한다.
        var favoriteStock = sync.await(exports.getFavoriteStock(isu_nm, sync.defer()));
        if(favoriteStock != null) {
            console.log('stock is already added');
            return false;
        }

        var stock = sync.await(exports.getStock(isu_nm, sync.defer()));
        if(stock == null) {
            stock = sync.await(exports.addStock(isu_nm, sync.defer()));
        }

        if(stock == null) {
            throw 'stock is null';
        }

        var doc = {
            isu_nm: isu_nm
        };

        doc = new FavoriteStock(doc);
        sync.await(doc.save(sync.defer()));

        return true;

    }, function(err, res) {
        callback(err, res);
    });
};

exports.deleteFavoriteStock = function(isu_nm, callback) {
    FavoriteStock.remove({"isu_nm": isu_nm}, callback);
};

exports.getExceptionStock = function(isu_nm, callback) {
    ExceptionStock.findOne({'isu_nm': isu_nm}, callback)
};

exports.getExceptionStockList = function(callback) {
    ExceptionStock.find({}, callback);
};

exports.addExceptionStock = function(isu_nm, callback) {
    sync.fiber(function() {
        var today = moment();

        //isu_nm에 해당하는 stock이 있는지 검사한다.
        var exceptionStock = sync.await(exports.getExceptionStock(isu_nm, sync.defer()));
        if(exceptionStock != null) {
            throw 'stock is already added';
        }

        var stock = sync.await(exports.getStock(isu_nm, sync.defer()));
        if(stock == null) {
            stock = sync.await(exports.addStock(isu_nm, sync.defer()));
        }

        if(stock == null) {
            throw 'stock is null';
        }

        var doc = {
            isu_nm: isu_nm
        };

        //exception 종목 추가 하기전에 현재 저장되어있는 거래 리스트에서도 제외한다.
        sync.await(tradinglib.deleteTrading(today.format('YYYYMMDD'), isu_nm, sync.defer()));

        doc = new ExceptionStock(doc);
        sync.await(doc.save(sync.defer()));

    }, function(err, res) {
        callback(err, res);
    });
};

exports.deleteExceptionStock = function(isu_nm, callback) {
    ExceptionStock.remove({"isu_nm": isu_nm}, callback);
};

exports.filterFavoriteStock = function(tradingList, callback) {
    sync.fiber(function() {

        var favoriteStockList = sync.await(exports.getFavoriteStockList(sync.defer()));
        favoriteStockList = favoriteStockList.map(function(favoriteStock) {
            return favoriteStock.toJSON();
        });

        var result = [];
        for(var i = 0; i<tradingList.length; i++) {
            var trading = tradingList[i];
            if(favoriteStockList.isIn('isu_nm', trading.isu_nm)) {
                result.push(trading);
            }
        }

        return result;

    }, function(err, res) {
        callback(err, res);
    });
};

exports.getBestStock = function(date, type, callback) {
    BestStock.findOne({'date': date, 'type': type}, callback);
};

exports.addBestStock = function(date, type, list, callback) {

    sync.fiber(function() {
        var result = sync.await(exports.getBestStock(date, type, sync.defer()));
        if(result === null) {
            var doc = new BestStock({
                date: date,
                type: type,
                list: list
            });
            sync.await(doc.save(sync.defer()));
        } else {
            result.list = list;
            sync.await(result.save(sync.defer()));
        }

    }, callback);
};

exports.filterBestStock = function(date, type, tradingList, callback) {
    sync.fiber(function() {

        var bestStock = sync.await(exports.getBestStock(date, type, sync.defer()));
        if(!bestStock) {
            throw 'best stock is null';
        }

        var bestStockList = bestStock.list;
        var result = [];
        for(var i = 0; i<tradingList.length; i++) {
            var trading = tradingList[i];
            if(bestStockList.isIn('kor_shrt_isu_nm', trading.isu_nm)) {
                result.push(trading);
            }
        }

        return result;

    }, function(err, res) {
        callback(err, res);
    });
};

exports.getAllBestStockList = function(date, exceptionStockList, callback) {
    var result = [];

    sync.fiber(function() {

        //KOSDAQ
        var bestStockList = sync.await(exports.getBestStock(date.format('YYYYMMDD'), 'kosdaq', sync.defer())).list;
        bestStockList.forEach(function(bestStock) {
            var isu_nm = bestStock.kor_shrt_isu_nm;
            if(exceptionStockList.isIn('isu_nm', isu_nm) === false) {
                result.push(sync.await(exports.getStock(isu_nm, sync.defer())));
            }
        });

        //KOSPI
        bestStockList = sync.await(exports.getBestStock(date.format('YYYYMMDD'), 'kospi', sync.defer())).list;
        bestStockList.forEach(function(bestStock) {
            var isu_nm = bestStock.kor_shrt_isu_nm;
            if(exceptionStockList.isIn('isu_nm', isu_nm) === false) {
                result.push(sync.await(exports.getStock(isu_nm, sync.defer())));
            }
        });

        return result;

    }, function(err, res) {
        if(err) console.log(err);
        callback(err, res);
    });
};

/*
dead code
 */
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