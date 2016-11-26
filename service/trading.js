var sync = require('synchronize');
var tradinglib = require('../lib/trading');
var stocklistlib = require('../lib/stocklist');
var debuglib = require('../lib/debug');
var memberlistlib = require('../lib/memberlist')
var otplib = require('../lib/otp');
var moment = require('moment');
var request = require('../lib/request');

exports.filterBestStock = function(date, type, tradingList, callback) {
    sync.fiber(function() {

        var bestStock = sync.await(stocklistlib.getBestStock(date, type, sync.defer()));
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

exports.filterFavoriteStock = function(tradingList, callback) {
    sync.fiber(function() {

        var favoriteStockList = sync.await(stocklistlib.getFavoriteStockList(sync.defer()));
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

exports.getTradingList = function(param, callback) {
    sync.fiber(function() {
        var result = [];
        var tradingList = sync.await(tradinglib.getTradingList(param, sync.defer()));
        if(param.type === 'favorite') {
            result = sync.await(exports.filterFavoriteStock(tradingList, sync.defer()));
        } else if(param.type === 'kosdaq' || param.type === 'kospi') {
            result = sync.await(exports.filterBestStock("20" + param.start, param.type, tradingList, sync.defer()));
        }
        
        return result;

    }, function(err, res) {
        callback(err, res);
    });
};

exports.getTrading = function(param, callback) {
    tradinglib.getTrading(param, callback);
};

exports.findTrading = function(param, callback) {
    var today = moment();
    sync.fiber(function() {
        var stocklist = [];
        stocklist.push(sync.await(stocklistlib.getStock(param.isu_nm, sync.defer())));
        var memberlist = sync.await(memberlistlib.getMemberList(sync.defer()));
        sync.await(makeTradingData(today, stocklist, memberlist, sync.defer()));
        var trading = sync.await(tradinglib.getTrading(param, sync.defer()));
        return trading;
    }, function(err, res) {
        if(err) console.log(err);
        callback(err, res);
    });
};

exports.findTradingList = function(typelist, callback) {

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
            stocklist = stocklist.concat(sync.await(stocklistlib.getAllBestStockList(today, exceptionStockList, sync.defer())));

            if(global.program.develop) {
                stocklist = debuglib.setFindTrading();
            }
        }

        //기관 리스트 조회
        var memberlist = sync.await(memberlistlib.getMemberList(sync.defer()));
        sync.await(makeTradingData(today, stocklist, memberlist, sync.defer()));
        console.log('Complete find trading');

    }, function(err, res) {
        if(err) console.log(err);
        callback(err, res);
    });
};

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
            var result = sync.await(request.requestTrading(stock, tradingCode, sync.defer()));
            result = JSON.parse(result.text);

            //현재 시세을 요청한다.
            var stockInfo = sync.await(request.requestStockInfo(stock, stockInfoCode, sync.defer()));
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

                if(memberlist.isIn('mbr_nm', member.mbr_nm)) {
                    //거래량 - 순매수 합
                    var number = member.netaskvol.replace(/,/gi, '');
                    number = parseFloat(number);
                    netaskvolSum += number;
                    if(tradinglib.isHidden(index)) {
                        netaskvolSumHidden += number;
                    }

                    //거래대금 순매수 합
                    number = member.netaskval.replace(/,/gi, '');
                    number = parseFloat(number);
                    netaskvalSum += number;
                    if(tradinglib.isHidden(index)) {
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

            var isu_nm = stock.isu_nm;
            var trading = {
                date: today.format('YYYYMMDD'),
                isu_srt_cd: stock.isu_srt_cd,
                isu_nm: isu_nm
            };

            var buy = {
                time: time,
                netaskval: netaskvalSum,
                netaskvol: netaskvolSum,
                netaskvalhidden: netaskvalSumHidden,
                netaskvolhidden: netaskvolSumHidden,
                stockinfo: stockInfo
            };

            sync.await(tradinglib.addTrading(trading, buy, sync.defer()));

            //거래 대금 순매수가 정해진 값 이상일경우 관심종목에 추가한다.
            /*
             if(netaskvalSum >= getAtutoAddValue(stock)) {
                 var result = sync.await(stocklistlib.addFavoriteStock(stocklist[i]['isu_nm'], sync.defer()));
                 if(result) {
                     REDIS.sadd(exports.getAutoAddRedisKey(), isu_nm, function(err, result) {
                         if(err) console.log(err);
                         REDIS.smembers(exports.getAutoAddRedisKey(), function(err, result) {
                            console.log(result);
                         });
                     });
                 }
             }
             */
            //TODO : 거래 대금 순매수가 정해진 값 이상일경우 grade를 올린다.
        }

    }, function(err, res) {
        callback(err, res);
    });
}