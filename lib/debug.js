/**
 * Created by LEE-DESKTOP on 2016-11-01.
 */

exports.init = function() {
    if(global.program.develop) {
        global.configure.cron.FIND_TRADING_TIME.TIME = '0 */1 * * * *';
        global.configure.cron.SEND_TRADING_FAVORITE = '0 * * * * *'; //slack send
    }
};

exports.setRequestBestStock = function(body) {
    body.period_strt_dd = '20161128';
    body.period_end_dd = '20161128';
};

exports.setFindTrading = function(stocklist) {

    //1종목만 테스트
    /*
    var stocklist = [{
        "isu_nm" : "오가닉티코스메틱",
        "isu_srt_cd" : "A900300",
        "isu_cdnm" : "A900300/오가닉티코스메틱",
        "isu_cd" : "HK0000312568",
        "market_name" : "KOSDAQ",
    }];
    */

    return stocklist;
};

exports.setRequestStockInfo = function(body) {
    body.fromdate = '20161128';
    body.todate = '20161129';
};

exports.setRequestTrading = function(body) {
    body.fromdate = '20161128';
    body.todate = '20161129';
};