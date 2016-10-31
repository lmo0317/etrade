/**
 * Created by LEE-DESKTOP on 2016-11-01.
 */

exports.init = function() {
    if(global.program.develop) {
        global.configure.cron.FIND_TRADING_BEST = '30 */10 * * * *';
        global.configure.cron.FIND_TRADING_FAVORITE = '0 */1 * * * *';
        global.configure.cron.SEND_TRADING_FAVORITE = '0 * * * * *';
    }
};

exports.setRequestBestStock = function(body) {
    body.period_strt_dd = '20160927';
    body.period_end_dd = '20160927';
};

exports.setFindTrading = function() {
    var stocklist = [{
        "isu_nm" : "티플랙스",
        "isu_srt_cd" : "A081150",
        "isu_cdnm" : "A081150/티플랙스",
        "isu_cd" : "KR7081150005",
        "market_name" : "KOSDAQ"
    }];

    return stocklist;
};

exports.setRequestStockInfo = function(body) {
    body.fromdate = '20160928';
    body.todate = '20160928';
};

exports.setRequestTrading = function(body) {
    body.fromdate = '20161017';
    body.todate = '20161018';
};