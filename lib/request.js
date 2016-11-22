/**
 * Created by LEE-DESKTOP on 2016-11-21.
 */
var superagent = require('superagent');
var request  = superagent.agent();
var stocklistlib = require('./stocklist');
var debuglib = require('../lib/debug');
var sync = require('synchronize');
var moment = require('moment');
var otplib = require('./otp');

var tradingURL = 'http://marketdata.krx.co.kr/contents/MKD/99/MKD99000001.jspx';
var top100StocksURL = 'http://marketdata.krx.co.kr/contents/MKD/99/MKD99000001.jspx';

exports.requestBestStock = function(code, today, type, callback) {
    sync.fiber(function() {

        var body = {
            sect_tp_cd: null,
            period_strt_dd: today.format('YYYYMMDD'),
            period_end_dd:today.format('YYYYMMDD'),
            pagePath: '/contents/MKD/10/1002/10020310/MKD10020310.jsp',
            code: code
        };

        if(type === 'kosdaq') {
            body.ind_tp = 'KSQ';
            body.idx_type = 2001;
        } else if(type === 'kospi') {
            body.ind_tp = 'STK';
            body.idx_type =  1001;
        }

        if(global.program.develop) {
            debuglib.setRequestBestStock(body);
        }

        request
            .post(top100StocksURL)
            .type('form')
            .send(body)
            .end(sync.defer());

        var result = sync.await();
        result = JSON.parse(result.text);
        result = result.block1.splice(0, 99);
        result = result.map(function(stock) {
            return {
                kor_shrt_isu_nm: stock.kor_shrt_isu_nm,
                isu_end_pr: stock.isu_end_pr
            }
        });

        result.forEach(function(stock) {
            //새로운 stock정보 저장
            sync.await(stocklistlib.addStock(stock.kor_shrt_isu_nm, sync.defer()));
        });

        //best stock 추가
        sync.await(stocklistlib.addBestStock(today.format('YYYYMMDD'), type, result, sync.defer()));

    }, function(err, res) {
        console.log('Complete Find ', type);
        callback(err, res);
    });
};

exports.getStockCode = function(isu_nm, callback) {
    var stockCodeURL = 'http://marketdata.krx.co.kr/contents/MKD/99/MKD99000001.jspx';
    sync.fiber(function() {
        console.log('getStockCode');
        var code = sync.await(otplib.requestStockCodeOTP(sync.defer())).text;
        var body = {
            isu_cd : null,
            no: 'P1',
            mktsel: 'ALL',
            searchText: isu_nm,
            pagePath: '/contents/COM/FinderStkIsu.jsp',
            code: code
        };

        request
            .post(stockCodeURL)
            .type('form')
            .send(body)
            .end(sync.defer());

        var result = sync.await();
        result = JSON.parse(result.text);

        for(var i=0; i<result.block1.length; i++) {
            var stock = result.block1[i];
            if(stock.codeName === isu_nm) {
                return stock;
            }
        }

    }, function(err, res) {
        callback(err, res);
    });
};

exports.requestStockInfo = function(stock, code, callback) {

    //오늘의 날짜 검색
    var today = moment();
    var tomorrow = moment().add(1,'days');

    var body = {
        pagePath: '/contents/MKD/10/1002/10020102/MKD10020102.jsp',
        period_selector: 'day',
        code: code,
        fromdate: today.format('YYYYMMDD'),
        todate: tomorrow.format('YYYYMMDD'),
        isu_nm: stock['isu_nm'],
        isu_srt_cd: stock['isu_srt_cd'],
        isu_cdnm: stock['isu_cdnm'],
        isu_cd: stock['isu_cd'],
        bldcode: 'COM/hpkorcom02001_2'
    };

    //개발 모드에서 임시데이터 세팅
    if(global.program.develop) {
        debuglib.setRequestStockInfo(body);
    }

    //현재 종목의 정보를 요청한다.
    request
        .post(tradingURL)
        .type('form')
        .send(body)
        .end(callback);
};

exports.requestTrading = function(stock, code, callback) {

    //오늘의 날짜 검색
    var today = moment();
    var tomorrow = moment().add(1,'days');

    var body = {
        pagePath: '/contents/MKD/10/1002/10020102/MKD10020102.jsp',
        period_selector: 'day',
        code: code,
        fromdate: today.format('YYYYMMDD'),
        todate: tomorrow.format('YYYYMMDD'),
        isu_nm: stock['isu_nm'],
        isu_srt_cd: stock['isu_srt_cd'],
        isu_cdnm: stock['isu_cdnm'],
        isu_cd: stock['isu_cd']
    };

    //개발 모드에서 임시데이터 세팅
    if(global.program.develop) {
        debuglib.setRequestTrading(body);
    }

    //현재 매매 정보를 요청한다.
    request
        .post(tradingURL)
        .type('form')
        .send(body)
        .end(callback);
};