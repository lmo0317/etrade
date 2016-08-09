/**
 * Created by LEE-DESKTOP on 2016-08-02.
 */

var superagent = require('superagent');
var request  = superagent.agent();
var sync = require('synchronize');
var fs = require('fs');

var intervalTime = 1000 * 60 * 20;

var body = {
    fromdate: '20160805',
    pagePath: '/contents/MKD/10/1002/10020102/MKD10020102.jsp',
    period_selector: 'day',
    todate: '20160805'
};

function requestOTP(callback) {
    //top 50 http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102&name=form;
    //top 10 http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102_chart&name=visual

    var urlTop10 = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102_chart&name=visual';
    var urlTop50 = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102&name=form';

    //top 50
    request.get(urlTop50).end(callback);
}

var statistics = [];

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
        array.push({isu_nm: key, trade: statistics[key].trade});
    });

    array.sort(function(a, b) {
        return a.trade[a.trade.length - 1] - b.trade[b.trade.length - 1];
    });

    return array;
}

function searchProcess() {
    sync.fiber(function() {

        console.log('start');

        //list.json에서 검사할 stock list를 얻어온다.
        var data = sync.await(fs.readFile('stocklist.json', 'utf8', sync.defer()));
        var stocklist = JSON.parse(data);

        data = sync.await(fs.readFile('memberlist.json', 'utf8', sync.defer()));
        var memberlist = JSON.parse(data);

        //OTP 코드 생성
        var code = sync.await(requestOTP(sync.defer())).text;

        //생성된 OTP코드를 포함한다.
        body.code = code;

        //모든 주식 종목들을 검사한다.
        for(var i=0;i < stocklist.length; i++)
        {
            Object.keys( stocklist[i] ).forEach( function( key ) {
                body[key] = stocklist[i][key];
            });

            body['isu_cdnm'] = body['isu_srt_cd'] + '/' + body['isu_nm'];
            var isu_srt_cd = body['isu_srt_cd'].substr(1,6);
            body['isu_cd'] = 'KR7' + isu_srt_cd + '00' + makeLastKey(isu_srt_cd);

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

            if(!statistics[body.isu_nm]) {
                statistics[body.isu_nm] = {};
            }

            if(!statistics[body.isu_nm].trade) {
                statistics[body.isu_nm].trade = [];
            }

            statistics[body.isu_nm].trade.push(sum);
        }

        var array = sortStatistics(statistics);
        array.forEach(function(value) {
            console.log('종목 : ' + value.isu_nm);
            console.log('거래 총합 : ' + getTradeToString(value.trade));
        });
        console.log('complete');

    }, function(err, res) {

    });
}

(function main() {
    searchProcess();
    setInterval(searchProcess, intervalTime);
})();