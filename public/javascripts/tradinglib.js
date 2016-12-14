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
    } else if(type === 'member_chart') {
        if(buylist.length > 0) {
            var memberlist = buylist[buylist.length - 1].memberlist;

            //0이하는 버린다.
            memberlist = memberlist.filter(function(member) {
                var netaskval = parseInt(member.netaskval.replace(/,/g, ""),10);
                if(parseInt(netaskval,10) > 0) {
                    return true;
                }
            });

            //내림 차순 정렬
            memberlist = memberlist.sort(function(a, b) {
                var v1 = parseInt(a.netaskval.replace(/,/g, ""),10);
                var v2 = parseInt(b.netaskval.replace(/,/g, ""),10);
                return v2- v1;
            });

            //상위 15개 까지만 구한다.
            memberlist = memberlist.splice(0, 15);
            buylist[buylist.length - 1].memberlist = memberlist;
        }
    }

    stock.buylist = buylist;
}
