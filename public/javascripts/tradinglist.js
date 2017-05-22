var _tradingData = null;

$(document).ready(function (){
    init();
});

function init() {

    //1분에 한번씩 process 호출
    //setInterval(process, 1000 * 60);

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
            console.log(start);
        }
    );

    addButton();
    new Tablesort(document.getElementById('sort'));
}

function process()
{
    getTradingList();
    console.log('process');
}

function refreshData(tradingData)
{
    makeTradeTableProcess(tradingData);
}

function makeTradeTableProcess(data)
{
    $("#tbody_trading_container").html('');
    makeTradeTable(data);
}

function getTradingList()
{
    $.ajax({
        url: '/tradinglist',
        type: 'get',
        data: {
            start: $("#edit_start").val(),
            type: $("#type").val()
        },
        success:function(data) {
            _tradingData = data;
            refreshData(_tradingData);
        },
        error:function(err) {
            console.log(err);
            alert(err.responseText);
        }
    });
}

function makeTradeTable(data) {

    data.forEach(function(stock) {

        var tr = $("<tr>").attr("id", "tr_trading_list");
        var td_name = $("<td>").attr("id", "td_name");
        //td_name.text(stock.isu_nm);
        td_name.html("<a href='#'>" + stock.isu_nm + "</a>");
        td_name.click(function() {
            clickDetailButton(stock);
        });

        var stockInfo = stock.buylist[stock.buylist.length - 1].stockinfo;
        var updn_rate = numberWithCommas((stockInfo && stockInfo.updn_rate) || 0); //등락률
        var td_trading_updn_rate = $("<td>").attr("id", "td_trading_updn_rate");

        if(updn_rate > 0) {
            td_trading_updn_rate.html('<font color="#FF0000">' + updn_rate + '</font>');
        } else if (updn_rate < 0) {
            td_trading_updn_rate.html('<font color="#0000FF">' + updn_rate + '</font>');
        } else {
            td_trading_updn_rate.text(updn_rate);
        }

        //순매수
        var td_trading_netaskval = $("<td>").attr("id", "td_trading_netaskval");
        var netaskval = numberWithCommas(stock.buylist[stock.buylist.length - 1].netaskval);
        td_trading_netaskval.text(netaskval);

        //거래대금
        var isu_tr_amt = (stockInfo && stockInfo.isu_tr_amt) || 0;
        var td_trading_isu_tr_amt = $("<td>").attr("id", "td_trading_isu_tr_amt");
        td_trading_isu_tr_amt.text(isu_tr_amt);

        //버튼 추가
        var td_button = $("<td>").attr("id", "td_button");

        tr.append(td_name);
        tr.append(td_trading_updn_rate); //등락률
        tr.append(td_trading_netaskval); //순매수
        tr.append(td_trading_isu_tr_amt); //거래 대금
        $("#tbody_trading_container").append(tr);
    });
}

function addButton() {

    $("#btn_search").click(function(){
        getTradingList();
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
        edit_start.val($("#edit_start").val());
    };
}