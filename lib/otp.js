/**
 * Created by LEE-DESKTOP on 2016-09-26.
 */
var superagent = require('superagent');
var request  = superagent.agent();

exports.requestOTP = function(callback) {
    var url = 'http://marketdata.krx.co.kr/contents/COM/GenerateOTP.jspx?bld=MKD/10/1002/10020102/mkd10020102&name=form';
    request.get(url).end(callback);
};