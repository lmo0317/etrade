var superagent = require('superagent');
var request  = superagent.agent();
var sync = require('synchronize');
var fs = require('fs');
var stocklistlib = require('./stocklist');
var moment = require('moment');
var trading = require('../schema/trading');
var mongoose = require('mongoose');
var Trading = mongoose.model('Trading', trading.TradingSchema);

var body = {
    pagePath: '/contents/MKD/10/1002/10020102/MKD10020102.jsp',
    period_selector: 'day'
};

function requestOTP(callback) {
    //top 50 http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102&name=form;
    //top 10 http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102_chart&name=visual
    var urlTop10 = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102_chart&name=visual';
    var urlTop50 = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102&name=form';
    request.get(urlTop50).end(callback);
}

function isInMemberList(memberlist, mbr_nm) {

    for(var i=0;i < memberlist.length;i++) {
        if(memberlist[i].mbr_nm === mbr_nm) {
            return true;
        }
    }
    return false;
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

function sumCheckCode(value) {
    if(value > 9) {
        return value % 10 + parseInt(value / 10);
    } else {
        return value;
    }
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getTradeToString(trade) {
    var str = '';
    for(var i=0;i<trade.length;i++) {
        str += trade[i] + ', ';
    }
    return str;
}

function sortStatistics(statistics) {

    var array = [];
    Object.keys(statistics).forEach(function(key) {
        array.push({isu_nm: key, trade: statistics[key]});
    });

    array.sort(function(a, b) {
        return b.trade - a.trade;
    });

    return array;
}

exports.addTrading = function(trading, callback) {
    var doc = new Trading(trading);
    doc.save(callback);
};

exports.getTrading = function(callback) {  

};

exports.getTrading = function(param, callback) {

};

exports.findTrading = function(callback) {

    sync.fiber(function() {
        console.log('start');
        var stocklist = sync.await(stocklistlib.getStocklist(sync.defer()));
        stocklist = stocklist.map(function(stock) {
            return stock.toObject();
        });

        var data = sync.await(fs.readFile('memberlist.json', 'utf8', sync.defer()));
        var memberlist = JSON.parse(data);

        var date = moment().format('YYYYMMDDHHMM');

        //OTP 코드 생성
        var code = sync.await(requestOTP(sync.defer())).text;
        body.code = code;
        body.fromdate = moment().format('YYYYMMDD');
        body.todate = moment().format('YYYYMMDD');

        //모든 주식 종목들을 검사한다.
        var ret = {};
        for(var i=0;i < stocklist.length; i++)
        {
            body['isu_nm'] = stocklist[i]['isu_nm'];
            body['isu_srt_cd'] = stocklist[i]['isu_srt_cd'];
            body['isu_cdnm'] = stocklist[i]['isu_cdnm'];
            body['isu_cd'] = stocklist[i]['isu_cd'];

            //현재 매매 정보를 요청한다.
            request.post('http://marketdata.krx.co.kr/contents/MKD/99/MKD99000001.jspx').type('form').send(body).end(sync.defer());
            var result = sync.await();
            result = JSON.parse(result.text);
            var sum = 0;

            result.block1.forEach(function(member) {
                if(isInMemberList(memberlist, member.mbr_nm)) {
                    var number = member.netaskvol.replace(',', '');
                    number = parseFloat(number);
                    sum += number;
                }
            });

            ret[body.isu_nm] = sum;
            console.log('종목 : ' + body.isu_nm);
            console.log('거래 총합 : ' +  numberWithCommas(sum));

            var trading = {
                date: date,
                isu_cd: stocklist[i]['isu_cd'],
            };

            sync.await(exports.addTrading(trading, sync.defer()));
        }

        return sortStatistics(ret);

    }, function(err, res) {
        callback(err, res);
    });
};