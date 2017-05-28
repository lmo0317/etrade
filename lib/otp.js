/**
 * Created by LEE-DESKTOP on 2016-09-26.
 */
var superagent = require('superagent');
var request  = superagent.agent();

exports.requestTradingOTP = function(callback) {
    var url = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102&name=form';
    request.get(url).end(callback);
};

exports.requestBestStocksOTP = function(callback) {
    var url = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD%2F10%2F1002%2F10020310%2Fmkd10020310&name=form';
    request.get(url).end(callback);
};

exports.requestStockCodeOTP = function(callback) {
    var url = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=COM%2Ffinder_stkisu&name=form';
    request.get(url).end(callback);
};

exports.requestStockInfoOTP = function(callback) {
    var url = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=COM%2Fhpkorcom02001_2&name=tablesubmit';
    request.get(url).end(callback);
};

exports.requestStockTrendOTP = function(callback) {
    var url = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD%2F10%2F1002%2F10020103%2Fmkd10020103_01&name=form&_=1495467880115';
    request.get(url).end(callback);
};