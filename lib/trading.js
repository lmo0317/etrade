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
var debuglib = require('./debug');

function isInMemberList(memberlist, mbr_nm) {
    for(var i=0;i < memberlist.length;i++) {
        if(memberlist[i].mbr_nm === mbr_nm) {
            return true;
        }
    }
    return false;
}

exports.addTrading = function(trading, buyInfo, callback) {
    //var doc = new Trading(trading);
    sync.fiber(function() {
        var result = sync.await(Trading.findOne({date: trading.date, isu_srt_cd: trading.isu_srt_cd }, sync.defer()));
        if(!result || result.length == 0) {
            //trading 없을경우 추가
            trading.buylist = [buyInfo];
            var doc = new Trading(trading);
            sync.await(doc.save(sync.defer()));
        } else {

            var buylist = [];
            result.buylist.forEach(function(buy) {
                if(buy.time !== buyInfo.time) {
                    buylist.push(buy);
                }
            });

            buylist.push(buyInfo);
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

exports.deleteTrading = function(date, isu_nm, callback) {
    Trading.remove({'date': date, 'isu_nm': isu_nm}, callback);
};

exports.getAllBestStockList = function(date, exceptionStockList, callback) {
    var result = [];

    sync.fiber(function() {

        //KOSDAQ
        var bestStockList = sync.await(stocklistlib.getBestStock(date.format('YYYYMMDD'), 'kosdaq', sync.defer())).list;
        bestStockList.forEach(function(bestStock) {
            var isu_nm = bestStock.kor_shrt_isu_nm;
            if(exceptionStockList.isIn('isu_nm', isu_nm) === false) {
                result.push(sync.await(stocklistlib.getStock(isu_nm, sync.defer())));
            }
        });

        //KOSPI
        bestStockList = sync.await(stocklistlib.getBestStock(date.format('YYYYMMDD'), 'kospi', sync.defer())).list;
        bestStockList.forEach(function(bestStock) {
            var isu_nm = bestStock.kor_shrt_isu_nm;
            if(exceptionStockList.isIn('isu_nm', isu_nm) === false) {
                result.push(sync.await(stocklistlib.getStock(isu_nm, sync.defer())));
            }
        });

        return result;

    }, function(err, res) {
        if(err) console.log(err);
        callback(err, res);
    });
};

function isHidden(index) {
    //HTS에서 제공하지 않은 숨겨진 멤버인지 검사한다.
    return !(index >= 0 && index <= 4);
}

function makeTradingData(today, stocklist, memberlist, callback)
{
    sync.fiber(function() {

        //시간
        var time = today.format('HHmm');

        //OTP 코드 생성
        var tradingCode = sync.await(otplib.requestTradingOTP(sync.defer())).text;
        var stockInfoCode = sync.await(otplib.requestStockInfoOTP(sync.defer())).text;

        for(var i=0;i < stocklist.length; i++)
        {
            var stock = stocklist[i];

            //거래량을 조회한다.
            var result = sync.await(exports.requestTrading(stock, tradingCode, sync.defer()));
            result = JSON.parse(result.text);

            //현재 시세을 요청한다.
            var stockInfo = sync.await(exports.requestStockInfo(stock, stockInfoCode, sync.defer()));
            stockInfo = JSON.parse(stockInfo.text);
            stockInfo = stockInfo.block1[0];

            /*
             cmpr_rt = "80" //전일대비
             isu_cur_pr = "7,180" //현재가
             isu_hg_pr = "7,300" //고가
             isu_lw_pr = "7,120" //저가
             isu_opn_pr = "7,120" //시가
             isu_tr_amt = "772,181,980" //거래대금
             isu_tr_vl = "107,133" //거래량
             kor_isu_nm = ""
             updn_rate = "01.13" //등락률
             updn_typ = "1"
             */

            var netaskvolSum = 0;
            var netaskvolSumHidden = 0;
            var netaskvalSum = 0;
            var netaskvalSumHidden = 0;

            //매도량 기준으로 내림 차순 정리
            var tradingMemberList = result.block1;
            tradingMemberList.sort(function(a, b) {
                var v1 = a.bidvol.replace(/,/gi, '');
                v1 = parseFloat(v1);
                var v2 = b.bidvol.replace(/,/gi, '');
                v2 = parseFloat(v2);
                return v2 - v1;
            });

            for(var j=0; j < tradingMemberList.length; j++)
            {
                var index = j;
                var member = tradingMemberList[index];

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
                    var number = member.netaskvol.replace(/,/gi, '');
                    number = parseFloat(number);
                    netaskvolSum += number;
                    if(isHidden(index)) {
                        netaskvolSumHidden += number;
                    }

                    //거래대금 순매수 합
                    number = member.netaskval.replace(/,/gi, '');
                    number = parseFloat(number);
                    netaskvalSum += number;
                    if(isHidden(index)) {
                        netaskvalSumHidden += number;
                    }
                }
            }

            /**
             * SAVE FINDING LOG
             */
            if( global.configure.log.level === 'high') {
                console.log('종목 : ' + stock.isu_nm);
                console.log('거래량 순매수: ' + utilLib.numberWithCommas(netaskvolSum));
                console.log('거래대금 순매수 : ' + utilLib.numberWithCommas(netaskvalSum));
                if (stockInfo) {
                    console.log('등락률 : ' + stockInfo.updn_rate);
                }
            }

            var trading = {
                date: today.format('YYYYMMDD'),
                isu_srt_cd: stocklist[i]['isu_srt_cd'],
                isu_nm: stocklist[i]['isu_nm']
            };

            var buy = {
                time: time,
                netaskval: netaskvalSum,
                netaskvol: netaskvolSum,
                netaskvalhidden: netaskvalSumHidden,
                netaskvolhidden: netaskvolSumHidden,
                stockinfo: stockInfo
            };

            sync.await(exports.addTrading(trading, buy, sync.defer()));

            //거래 대금 순매수가 정해진 값 이상일경우 관심종목에 추가한다.
            if(netaskvalSum >= global.configure.autoadd.min) {
                sync.await(stocklistlib.addFavoriteStock(stocklist[i]['isu_nm'], sync.defer()));
            }
        }

    }, function(err, res) {
        callback(err, res);
    });
}

exports.makeSimpleText = function(tradinglist) {
    var result = "";

    for(var i = 0; i < tradinglist.length; i++) {
        var trading = tradinglist[i];
        var lastIndex = trading.buylist.length - 1;
        var buy = trading.buylist[lastIndex];
        var prev = null;
        if(lastIndex > 0) {
            prev = trading.buylist[lastIndex - 1];
        }

        result += '===== ' + trading.isu_nm + '===== \n' +
                    '등락률 : ' + (buy.stockinfo ? utilLib.numberWithCommas(buy.stockinfo.updn_rate) : 0) + '\n' +
                    '거래 대금 : ' + utilLib.numberWithCommas(buy.netaskval) + '\n' +
                    '이전 거래 대금 : ' + (prev ? utilLib.numberWithCommas(prev.netaskval) : 0) + '\n';
    }

    return result;
};

exports.findTrading = function(typelist, callback) {

    sync.fiber(function() {
        console.log('Find Trading');
        var today = moment();

        var stocklist = [];

        if(typelist.contains('favorite')) {

            //관심 종목
            var favoriteStockList = sync.await(stocklistlib.getFavoriteStockList(sync.defer()));
            favoriteStockList.forEach(function(favoriteStock) {
                var isu_nm = favoriteStock.isu_nm;
                stocklist.push(sync.await(stocklistlib.getStock(isu_nm, sync.defer())));
            });

        } else if(typelist.contains('best')) {
            //제외 종목
            var exceptionStockList = sync.await(stocklistlib.getExceptionStockList(sync.defer()));

            //현재 시간 최대 매매 종목
            stocklist = stocklist.concat(sync.await(exports.getAllBestStockList(today, exceptionStockList, sync.defer())));

            if(global.program.develop) {
                stocklist = debuglib.setFindTrading();
            }
        }

        //기관 리스트 조회
        var memberlist = sync.await(memberlistlib.getMemberList(sync.defer()));
        sync.await(makeTradingData(today, stocklist, memberlist, sync.defer()));

        console.log('Complete find trading');

        return;

    }, function(err, res) {
        if(err) console.log(err);
        callback(err, res);
    });
};

/**
 * REQUEST
 */

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