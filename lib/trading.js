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
    var url = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102&name=form';
    request.get(url).end(callback);
}

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
    //var doc = new Trading(trading);
    sync.fiber(function() {
        var result = sync.await(Trading.findOne({date: trading.date, isu_srt_cd: trading.isu_srt_cd }, sync.defer()));
        if(!result || result.length == 0) {
            //trading 없을경우 추가
            var doc = new Trading(trading);
            sync.await(doc.save(sync.defer()));
        } else {

            var trade = {};
            
            //기존 데이터 저장
            Object.keys(result.trade).forEach(function(key) {
                trade[key] = result.trade[key];
            });

            //새로운 데이터 저장
            Object.keys(trading.trade).forEach(function(key) {
                trade[key] = trading.trade[key];
            });

            result.trade = trade;
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
        console.log('start');

        var stocklist = sync.await(stocklistlib.getStocklist(sync.defer()));
        stocklist = stocklist.map(function(stock) {
            return stock.toObject();
        });

        var data = sync.await(fs.readFile('memberlist.json', 'utf8', sync.defer()));
        var memberlist = JSON.parse(data);

        var date = moment();
        var minute = parseInt(date.format('mm'));
        var time = date.format('HH') + (Math.floor(minute / 20) * 20).padLeft(2,0);

        //OTP 코드 생성
        var code = sync.await(requestOTP(sync.defer())).text;
        body.code = code;
        body.fromdate = date.format('YYYYMMDD');
        body.todate = date.format('YYYYMMDD');

        //모든 주식 종목들을 검사한다.
        var ret = {};

        //개발 모드에서 임시데이터 세팅
        if(global.program.develop) {
            body.fromdate = '20160818';
            body.todate = '20160818';
            stocklist = [stocklist[0]];
            time = date.format('HHmm');
        }

        for(var i=0;i < stocklist.length; i++)
        {
            var stock = stocklist[i];

            body['isu_nm'] = stock['isu_nm'];
            body['isu_srt_cd'] = stock['isu_srt_cd'];
            body['isu_cdnm'] = stock['isu_cdnm'];
            body['isu_cd'] = stock['isu_cd'];

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
                date: date.format('YYYYMMDD'),
                isu_srt_cd: stocklist[i]['isu_srt_cd'],
                isu_nm: stocklist[i]['isu_nm'],
                trade: {}
            };
            trading.trade[time] = sum;
            sync.await(exports.addTrading(trading, sync.defer()));
        }

        return sortStatistics(ret);

    }, function(err, res) {
        callback(err, res);
    });
};