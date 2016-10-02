var superagent = require('superagent');
var request  = superagent.agent();
var sync = require('synchronize');
var fs = require('fs');
var stocklistlib = require('./stocklist');
var memberlistlib = require('./memberlist');
var moment = require('moment');
var trading = require('../schema/trading');
var mongoose = require('mongoose');
var Trading = mongoose.model('Trading', trading.TradingSchema);
var tradingURL = 'http://marketdata.krx.co.kr/contents/MKD/99/MKD99000001.jspx';
var otplib = require('./otp');
var utilLib = require('./util');

function isInMemberList(memberlist, mbr_nm) {
    for(var i=0;i < memberlist.length;i++) {
        if(memberlist[i].mbr_nm === mbr_nm) {
            return true;
        }
    }
    return false;
}

exports.addTrading = function(trading, buy, callback) {
    //var doc = new Trading(trading);
    sync.fiber(function() {
        var result = sync.await(Trading.findOne({date: trading.date, isu_srt_cd: trading.isu_srt_cd }, sync.defer()));
        if(!result || result.length == 0) {
            //trading 없을경우 추가
            trading.buylist = [buy];
            var doc = new Trading(trading);
            sync.await(doc.save(sync.defer()));
        } else {

            var buylist = [];
            result.buylist.forEach(function(buy) {
                buylist.push(buy);
            });

            buylist.push(buy);
            result.buylist = buylist;
            sync.await(result.save(sync.defer()));
        }

    }, callback);
};

exports.getTradingList = function(param, callback) {
    var start = '20' + param.start;
    var end = '20' + param.start;
    Trading.find({date: {$gte:start, $lte:end}}, callback);
};

exports.getTrading = function(param, callback) {

};

exports.findTrading = function(callback) {

    sync.fiber(function() {
        console.log('findTrading');

        //시간
        var today = moment();
        var tomorrow = moment().add(1,'days');
        var minute = parseInt(today.format('mm'));
        var time = today.format('HH') + (Math.floor(minute / 20) * 20).padLeft(2,0);

        //관심 종목
        var stocklist = [];
        var favoriteStockList = sync.await(stocklistlib.getFavoriteStockList(sync.defer()));
        favoriteStockList.forEach(function(favoriteStock) {
            var isu_nm = favoriteStock.isu_nm;
            stocklist.push(sync.await(stocklistlib.getStock(isu_nm, sync.defer())));
        });

        //현재 시간 최대 매매 종목
        var bestStockList = sync.await(stocklistlib.getBestStock(today.format('YYYYMMDD'), sync.defer()));
        bestStockList.list.forEach(function(bestStock) {
            var isu_nm = bestStock.kor_shrt_isu_nm;
            stocklist.push(sync.await(stocklistlib.getStock(isu_nm, sync.defer())));
        });

        //기관 리스트 조회
        var memberlist = sync.await(memberlistlib.getMemberList(sync.defer()));

        //OTP 코드 생성
        var tradingCode = sync.await(otplib.requestTradingOTP(sync.defer())).text;
        var stockInfoCode = sync.await(otplib.requestStockInfoOTP(sync.defer())).text;

        if(global.program.develop) {
            time = today.format('HHmm');
        }

        for(var i=0;i < stocklist.length; i++)
        {
            var stock = stocklist[i];

            //현재 시세을 요청한다.

            //거래량을 조회한다.
            var result = sync.await(exports.requestTrading(stock, tradingCode, sync.defer()));
            result = JSON.parse(result.text);

            var stockInfo = sync.await(exports.requestStockInfo(stock, stockInfoCode, sync.defer()));
            stockInfo = JSON.parse(stockInfo.text);

            var netaskvolSum = 0;
            var netaskvalSum = 0;

            result.block1.forEach(function(member) {

                /*
                 rank = "1" //순위
                 mbr_nm = "삼성증권" //회원사
                 askvol = "30,939" //거래량 - 매도
                 bidvol = "12,775" //거래량 - 매수
                 netaskvol = "-18,164" //거래량 - 순매수
                 askval = "272,339,400" //거래대금 - 매도
                 bidval = "113,112,320" //거래대금 - 매수
                 netaskval = "-159,227,080" //거래대금 - 순매수
                */

                if(isInMemberList(memberlist, member.mbr_nm)) {
                    //거래량 - 순매수 합
                    var number = member.netaskvol.replace(',', '');
                    number = parseFloat(number);
                    netaskvolSum += number;

                    //거래대금 순매수 합
                    number = member.netaskval.replace(/,/gi, '');
                    number = parseFloat(number);
                    netaskvalSum += number;
                }
            });

            console.log('종목 : ' + stock.isu_nm);
            console.log('거래량 순매수: ' +  utilLib.numberWithCommas(netaskvolSum));
            console.log('거래대금 순매수 : ' + utilLib.numberWithCommas(netaskvalSum));

            var trading = {
                date: today.format('YYYYMMDD'),
                isu_srt_cd: stocklist[i]['isu_srt_cd'],
                isu_nm: stocklist[i]['isu_nm']
            };

            var buy = {
                time: time,
                netaskval: netaskvalSum,
                netaskvol: netaskvolSum
            };

            sync.await(exports.addTrading(trading, buy, sync.defer()));
        }

        return;

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
        body.fromdate = '20160928';
        body.todate = '20160928';
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
        body.fromdate = '20160928';
        body.todate = '20160928';
    }

    //현재 매매 정보를 요청한다.
    request
        .post(tradingURL)
        .type('form')
        .send(body)
        .end(callback);
};