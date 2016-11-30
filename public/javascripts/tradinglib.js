/**
 * Created by LEE-DESKTOP on 2016-11-22.
 */

function chartInit(callback)
{
    google.charts.load('current', {'packages':['line', 'corechart']});
    google.charts.setOnLoadCallback(callback);
}

function convertProperData(type, stock)
{
    //장마감 시간 이상 데이터가 올경우 걸러 낸다.
    /*
    var buylist = [];
    for(var i = 0;i<stock.buylist.length;i++) {
        if(stock.buylist[i].time <= 1600) {
            buylist.push(stock.buylist[i]);
        }
    }
    */
    var buylist = stock.buylist;

    if(type === 'table' ) {
        buylist = buylist.sort(function(a, b) {
            return parseInt(b.time, 10) - parseInt(a.time,10);
        });
        buylist = buylist.splice(0, 20);
    } else if(type === 'chart') {
        buylist = buylist.sort(function(a, b) {
            return parseInt(a.time, 10) - parseInt(b.time,10);
        });
    }

    stock.buylist = buylist;
}
