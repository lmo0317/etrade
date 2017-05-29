var _tradingData = null;
var date = moment().format('YYMMDD');
var types = ['favorite', 'kosdaq', 'kospi'];

$(document).ready(function (){
    init();
});

function init() {
    console.log(moment().format('YYMMDD'));
    new Tablesort(document.getElementById('sort_table_favorite'));
    new Tablesort(document.getElementById('sort_table_kosdaq'));
    new Tablesort(document.getElementById('sort_table_kospi'));

    $('input[name="datepicker"]').daterangepicker(
        {
            singleDatePicker: true,
            showDropdowns: true,
            locale: {
                format: 'YYMMDD'
            },
            startDate: new Date()
        },
        function(start, end, label) {
            console.log(moment(start._d).format('YYMMDD'));
            date = moment(start._d).format('YYMMDD');
            console.log(date);
            getTradingListAll();
        }
    );

    //1분에 한번씩 process 호출
    setInterval(process, 1000 * 60);
    getTradingListAll();
}

function getTradingListAll()
{
    types.forEach(function(type) {
        getTradingList(type);
    });
}

function process()
{
    getTradingListAll();
}

function refreshData(data, type)
{
    makeTradeTable(data, type);
}

function getTradingList(type)
{
    $.ajax({
        url: '/tradinglist',
        type: 'get',
        data: {
            start: date,
            type: type,
            count: 30
        },
        success:function(data) {
            _tradingData = data;
            refreshData(_tradingData, type);
        },
        error:function(err) {
            console.log(err);
        }
    });
}

function makeTradeTable(data, type) {

    var name = "#tbody_trading_" + type + "_container";
    var container = $(name);
    container.html('');
    data.forEach(function(stock) {
        console.log(stock);

        var tr = $("<tr>").attr("id", "tr_trading_list");
        var td_name = $("<td>").attr("id", "td_name");
        td_name.html("<a href='#'>" + stock.isu_nm + "</a>");
        td_name.click(function() {
            clickDetailButton(stock);
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
        var netaskval = numberWithCommas((buylist.netaskval/1000000).toFixed(0));
        if(stock.fornnetask && buylist.netaskvol) {
            var percent = (parseIntRemoveComma(buylist.netaskvol) / parseIntRemoveComma(stock.fornnetask)) * 100;
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
        isu_tr_amt = (parseIntRemoveComma(isu_tr_amt) / 1000000).toFixed(0);
        isu_tr_amt = numberWithCommas(isu_tr_amt);
        if(stock.volume && stockInfo.isu_tr_vl) {
            var percent = (parseIntRemoveComma(stockInfo.isu_tr_vl) / parseIntRemoveComma(stock.volume)) * 100;
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

function clickDetailButton(stock) {
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