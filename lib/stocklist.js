//var superagent = require('superagent');
//var request  = superagent.agent();
var request = require('./request');
var sync = require('synchronize');
var fs = require('fs');
var stock = require('../schema/stock');
var otplib = require('./otp');
var tradinglib = require('./trading');
var debuglib = require('./debug');
var timelib = require('./time');


var mongoose = require('mongoose');
var Stock = mongoose.model('Stock', stock.StockSchema);
var BestStock = mongoose.model('BestStock', stock.BestStockSchema);
var FavoriteStock = mongoose.model('FavoriteStock', stock.FavoriteStockSchema);
var StockTrend = mongoose.model('StockTrend', stock.StockTrendSchema);

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

        var stockInfo = sync.await(request.getStockCode(isu_nm, sync.defer()));
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

exports.getStockTrend = function(isu_nm, date, callback) {
    if(date) {
        StockTrend.findOne({'isu_nm': isu_nm, lastdate: date}, callback);
    } else {
        StockTrend.findOne({'isu_nm': isu_nm}, callback);
    }
};

exports.addStockTrend = function(isu_nm, date, trendlist, callback) {
    sync.fiber(function() {
        var result = sync.await(exports.getStockTrend(isu_nm, null, sync.defer()));
        if(!result) {
            var doc = new StockTrend({
                isu_nm: isu_nm,
                lastdate: date,
                trendlist: trendlist
            });
            sync.await(doc.save(sync.defer()));

        } else {
            result.lastdate = date;
            result.trandlist = trendlist;
            sync.await(result.save(sync.defer()));
        }
    }, function(err, res) {
        callback(err, res);
    });
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

exports.getAllBestStockList = function(date, callback) {
    var result = [];

    sync.fiber(function() {

        //KOSDAQ
        var bestStockList = sync.await(exports.getBestStock(date.format('YYYYMMDD'), 'kosdaq', sync.defer())).list;
        bestStockList.forEach(function(bestStock) {
            var isu_nm = bestStock.kor_shrt_isu_nm;
            result.push(sync.await(exports.getStock(isu_nm, sync.defer())));
        });

        //KOSPI
        bestStockList = sync.await(exports.getBestStock(date.format('YYYYMMDD'), 'kospi', sync.defer())).list;
        bestStockList.forEach(function(bestStock) {
            var isu_nm = bestStock.kor_shrt_isu_nm;
            result.push(sync.await(exports.getStock(isu_nm, sync.defer())));
        });

        return result;

    }, function(err, res) {
        if(err) console.log(err);
        callback(err, res);
    });
};

/**
 * 종목의 외인 동향을 찾아본다.
 * @param stock
 * @param callback
 */
function convertStockTrend(trendList)
{
    trendList = trendList.splice(0, trendList.length - 1);
    trendList.forEach(function(trend) {
        trend.trd_dd = trend.trd_dd.replace(/\//g,"");
    });
    return trendList;
}

exports.makeStockTrend = function(stock, callback) {
    sync.fiber(function() {
        var today = timelib.getCurrentTime();
        //오늘 날짜 외인 동향이 있는지 검사 있을경우 skip
        var stockTrend = sync.await(exports.getStockTrend(stock.isu_nm, today.format('YYYYMMDD'), sync.defer()));
        if(stockTrend) {
            return;
        }
        var code = sync.await(otplib.requestStockTrendOTP(sync.defer())).text;
        var result = sync.await(request.requestStockTrend(stock, code, today, sync.defer()));
        result = JSON.parse(result.text);
        sync.await(exports.addStockTrend(stock.isu_nm, today.format('YYYYMMDD'), convertStockTrend(result.block1), sync.defer()));

    }, function(err, res) {
        callback(err, res);
    });
};

exports.findBestStocks = function(callback) {
    sync.fiber(function() {
        console.log('Start [ Find Best Stocks List ]');
        var code = sync.await(otplib.requestBestStocksOTP(sync.defer())).text;
        var today = timelib.getCurrentTime();
        sync.await(request.requestBestStock(code, today, 'kosdaq', sync.defer()));
        sync.await(request.requestBestStock(code, today, 'kospi', sync.defer()));
    }, function(err, res) {
        console.log('Complete [ Find Best Stocks List ]');
        callback(err, res);
    });
};
