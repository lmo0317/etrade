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

var body = {
    pagePath: '/contents/MKD/10/1002/10020102/MKD10020102.jsp',
    period_selector: 'day'
};

function isInMemberList(memberlist, mbr_nm) {
    for(var i=0;i < memberlist.length;i++) {
        if(memberlist[i].mbr_nm === mbr_nm) {
            return true;
        }
    }
    return false;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
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

        var stocklist = sync.await(stocklistlib.getStocklist(sync.defer()));
        stocklist = stocklist.map(function(stock) {
            return stock.toObject();
        });

        var memberlist = sync.await(memberlistlib.getMemberList(sync.defer()));
        var today = moment();
        var tomorrow = moment().add(1,'days');

        var minute = parseInt(today.format('mm'));
        var time = today.format('HH') + (Math.floor(minute / 20) * 20).padLeft(2,0);

        //OTP 코드 생성
        var code = sync.await(otplib.requestOTP(sync.defer())).text;
        body.code = code;
        body.fromdate = today.format('YYYYMMDD');
        body.todate = tomorrow.format('YYYYMMDD');

        //개발 모드에서 임시데이터 세팅
        if(global.program.develop) {

            //디버그 모드에서는 특정 stock만 조사한다.
            stocklist = [{
                "isu_nm" : "대아티아이",
                "isu_srt_cd" : "A045390",
                "isu_cdnm" : "A045390/대아티아이",
                "isu_cd" : "KR7045390002",
                "__v" : 0
            }];

            body.fromdate = '20160818';
            body.todate = '20160818';
            time = today.format('HHmm');
        }

        for(var i=0;i < stocklist.length; i++)
        {
            var stock = stocklist[i];

            body['isu_nm'] = stock['isu_nm'];
            body['isu_srt_cd'] = stock['isu_srt_cd'];
            body['isu_cdnm'] = stock['isu_cdnm'];
            body['isu_cd'] = stock['isu_cd'];

            //현재 매매 정보를 요청한다.
            request
                .post(tradingURL)
                .type('form')
                .send(body)
                .end(sync.defer());

            var result = sync.await();
            result = JSON.parse(result.text);
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

            console.log('종목 : ' + body.isu_nm);
            console.log('거래량 순매수: ' +  numberWithCommas(netaskvolSum));
            console.log('거래대금 순매수 : ' + numberWithCommas(netaskvalSum));

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