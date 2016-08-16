var superagent = require('superagent');
var request  = superagent.agent();
var sync = require('synchronize');
var fs = require('fs');
var stocklistlib = require('./stocklist');
var moment = require('moment');

var body = {
    pagePath: '/contents/MKD/10/1002/10020102/MKD10020102.jsp',
    period_selector: 'day'
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function isInMemberList(memberlist, mbr_nm) {

    for(var i=0;i < memberlist.length;i++) {
        if(memberlist[i].mbr_nm === mbr_nm) {
            return true;
        }
    }
    return false;
}

function requestOTP(callback) {
    //top 50 http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102&name=form;
    //top 10 http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102_chart&name=visual

    var urlTop10 = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102_chart&name=visual';
    var urlTop50 = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102&name=form';

    //top 50
    request.get(urlTop50).end(callback);
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

exports.findTrading = function(callback) {

    sync.fiber(function() {
        console.log('start');
        var stocklist = sync.await(stocklistlib.getStocklist(sync.defer()));
        stocklist = stocklist.map(function(stock) {
            return stock.toObject();
        });

        var data = sync.await(fs.readFile('memberlist.json', 'utf8', sync.defer()));
        var memberlist = JSON.parse(data);

        //OTP 코드 생성
        var code = sync.await(requestOTP(sync.defer())).text;

        //생성된 OTP코드를 포함한다.
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
        }

        return sortStatistics(ret);

    }, function(err, res) {
        callback(err, res);
    });

};