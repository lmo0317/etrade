var _tradingData = null;
var date = moment().format('YYMMDD');
var types = ['favorite', 'kosdaq', 'kospi'];

$(document).ready(function (){
    init();
});

function init() {
    console.log(moment().format('YYMMDD'));
    new Tablesort(document.getElementById('sort'));

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
            type: type
        },
        success:function(data) {
            _tradingData = data;
            if(_tradingData.length == 0) {
                //표시할 데이터가 없을경우 default 날짜로 다시 표시
                date = '170510';
                getTradingList(type);
            } else {
                refreshData(_tradingData, type);
            }
        },
        error:function(err) {
            console.log(err);
            //표시할 데이터가 없을경우 default 날짜로 다시 표시
            date = '170510';
            getTradingList(type);
        }
    });
}

function makeTradeTable(data, type) {

    var name = "#tbody_trading_" + type + "_container";
    var container = $(name);
    container.html('');
    data.forEach(function(stock) {

        var tr = $("<tr>").attr("id", "tr_trading_list");
        var td_name = $("<td>").attr("id", "td_name");
        td_name.html("<a href='#'>" + stock.isu_nm + "</a>");
        td_name.click(function() {
            clickDetailButton(stock);
        });

        var stockInfo = stock.buylist[stock.buylist.length - 1].stockinfo;
        var updn_rate = numberWithCommas((stockInfo && stockInfo.updn_rate) || 0); //등락률
        var td_trading_updn_rate = $("<td>").attr("id", "td_trading_updn_rate");
        td_trading_updn_rate.text(updn_rate);

        //순매수
        var td_trading_netaskval = $("<td>").attr("id", "td_trading_netaskval");
        var netaskval = numberWithCommas(stock.buylist[stock.buylist.length - 1].netaskval);
        td_trading_netaskval.text(netaskval);

        //거래대금
        var isu_tr_amt = (stockInfo && stockInfo.isu_tr_amt) || 0;
        var td_trading_isu_tr_amt = $("<td>").attr("id", "td_trading_isu_tr_amt");
        td_trading_isu_tr_amt.text(isu_tr_amt);

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
        edit_start.val($("#edit_start").val());
    };
}