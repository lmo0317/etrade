/**
 * Created by LEE-DESKTOP on 2016-11-22.
 */
var unit = 100000000;

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
        var memberlist = stock.memberlist;

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
        stock.memberlist = memberlist;
    }
    stock.buylist = buylist;
}

function makeTradeTable(data, container, tableType, date) {

    container.html('');
    if(tableType == "simple") {
        unit = 100000000;
    } else {
        unit = 1;
    }

    data.forEach(function(stock) {
        var tr = $("<tr>").attr("id", "tr_trading_list");
        var td_name = $("<td>").attr("id", "td_name");
        td_name.html("<a href='#'>" + stock.isu_nm + "</a>");
        td_name.click(function() {
            clickDetailButton(stock, date);
        });

        var buylist = stock.buylist[stock.buylist.length - 1];
        var stockInfo = buylist.stockinfo;
        var updn_rate = numberWithCommas((stockInfo && stockInfo.updn_rate) || 0); //등락률
        var td_trading_updn_rate = $("<td>").attr("id", "td_trading_updn_rate");
        td_trading_updn_rate.text(updn_rate);

        if(updn_rate > 0) {
            td_trading_updn_rate.html('<font color="#FF0000">' + updn_rate + '</font>');
        } else if (updn_rate < 0) {
            td_trading_updn_rate.html('<font color="#0000FF">' + updn_rate + '</font>');
        } else {
            td_trading_updn_rate.text(updn_rate);
        }

        //순매수
        var td_trading_netaskval = $("<td>").attr("id", "td_trading_netaskval");
        var netaskval = numberWithCommas((buylist.netaskval/unit).toFixed(0));
        if(stock.fornnetask && buylist.netaskvol) {
            var netaskvol = parseIntRemoveComma(buylist.netaskvol);
            var fornnetask = parseIntRemoveComma(stock.fornnetask);
            var percent = ((netaskvol - fornnetask) / Math.abs(fornnetask)) * 100;
            netaskval += "(" + percent.toFixed(2) + "%" + ")";
            if(percent > 100) {
                td_trading_netaskval.html('<font color="#FF0000">' + netaskval + '</font>');
            } else {
                td_trading_netaskval.html('<font color="#000000">' + netaskval + '</font>');
            }
        } else {
            td_trading_netaskval.text(netaskval);
        }

        //거래대금
        var td_trading_isu_tr_amt = $("<td>").attr("id", "td_trading_isu_tr_amt");
        var isu_tr_amt = (stockInfo && stockInfo.isu_tr_amt) || 0;
        var isu_tr_vl = (stockInfo && stockInfo.isu_tr_vl) || 0;

        isu_tr_amt = (parseIntRemoveComma(isu_tr_amt) / unit).toFixed(0);
        isu_tr_amt = numberWithCommas(isu_tr_amt);
        if(stock.volume && isu_tr_vl) {
            isu_tr_vl = parseIntRemoveComma(isu_tr_vl);
            var volume = parseIntRemoveComma(stock.volume);
            var percent = ((isu_tr_vl - volume) / Math.abs(volume)) * 100;
            isu_tr_amt += "(" + percent.toFixed(2) + "%" + ")";
            if(percent > 100) {
                td_trading_isu_tr_amt.html('<font color="#FF0000">' + isu_tr_amt + '</font>');
            } else {
                td_trading_isu_tr_amt.html('<font color="#000000">' + isu_tr_amt + '</font>');
            }
        } else {
            td_trading_isu_tr_amt.text(isu_tr_amt);
        }

        tr.append(td_name);
        tr.append(td_trading_updn_rate); //등락률
        tr.append(td_trading_netaskval); //순매수
        tr.append(td_trading_isu_tr_amt); //거래 대금
        container.append(tr);
    });
}

function clickDetailButton(stock, date) {
    if(stock.buylist.length <= 0) return;
    var pop = window.open('detailtrading.html');
    pop.onload = function() {
        var title = $(pop.document).find("#modal-title");
        title.text = stock.isu_nm;

        var isu_nm = $(pop.document).find("#isu_nm");
        isu_nm.val(stock.isu_nm);

        var edit_start = $(pop.document).find("#edit_start");
        edit_start.val(date);
    };
}