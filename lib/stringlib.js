/**
 * Created by LEE-DESKTOP on 2016-11-21.
 */

exports.makeSimpleText = function(tradinglist) {
    var result = "";

    for(var i = 0; i < tradinglist.length; i++) {
        var trading = tradinglist[i];
        var lastIndex = trading.buylist.length - 1;
        var buy = trading.buylist[lastIndex];
        var prev = null;
        if(lastIndex > 0) {
            prev = trading.buylist[lastIndex - 1];
        }

        result += '===== ' + trading.isu_nm + '===== \n' +
            '등락률 : ' + (buy.stockinfo ? utilLib.numberWithCommas(buy.stockinfo.updn_rate) : 0) + '\n' +
            '거래 대금 : ' + utilLib.numberWithCommas(buy.netaskval) + '\n' +
            '이전 거래 대금 : ' + (prev ? utilLib.numberWithCommas(prev.netaskval) : 0) + '\n';
    }

    return result;
};
