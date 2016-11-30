var _tradingData = null;

$(document).ready(function (){
    //init();
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
});

$(window).load( function() {
    init();
});

function init() {
    chartInit(function() {
        console.log('chart init');
        
        //거래 정보 요청
        getTrading();

        //1분에 한번씩 process 호출
        setInterval(process, 1000 * 60);

        //search 버튼 기능 부여
        addButton();
    });
}

/**
 *정해진 시간 마다 서버에 데이터를 요청한다.
 */
function process()
{
    getTrading();
    console.log('process');
}

function refreshData(tradingData)
{
    var chart = $("#detail_chart_div");
    var tbody = $("#tbody_trading_detail_container");
    chart.html('');
    tbody.html('');

    if(!tradingData) {
        $("#edit_start").val(moment().format("YYMMDD"));
        return;
    }

    $("#edit_start").val(tradingData.date.substr(2,6));
    makeDetailPage(chart, tbody, tradingData);
}

function getTrading()
{
    $.ajax({
        url: '/trading',
        type: 'get',
        data: {
            start: $("#edit_start").val(),
            isu_nm: $("#isu_nm").val()
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

function addButton() {

    $("#btn_search").click(function(){
        getTrading();
    });

    $("#btn_find").click(function(){
        findTrading();
    });
}


function makeDetailTable(tableTarget, stock) {

    stock = deepCopy(stock);
    convertProperData('table', stock);
    stock.buylist.forEach(function(buy) {
        //tr 추가
        var tr = $("<tr>").attr("id", "tr_trading_list");

        //time
        var td_time = $("<td>").attr("id", "td_name");
        td_time.text(buy.time);

        //등락률
        var td_trading_updn_rate = $("<td>").attr("id", "td_trading_updn_rate");
        var updn_rate = numberWithCommas((buy.stockinfo && buy.stockinfo.updn_rate) || 0);
        td_trading_updn_rate.text(updn_rate);

        //거래대금
        var td_trading_netaskval = $("<td>").attr("id", "td_trading_netaskval");
        //if( exception ) {
        //    td_trading_netaskval.text(numberWithCommas(buy.netaskvalhidden));
        //} else {
        td_trading_netaskval.text(numberWithCommas(buy.netaskval));
        //}

        tr.append(td_time);
        tr.append(td_trading_updn_rate);
        tr.append(td_trading_netaskval);
        tableTarget.append(tr);
    });
}

function makeChart(element, stock)
{
    stock = deepCopy(stock);
    convertProperData('chart', stock);

    var div_graph = document.createElement("div");
    div_graph.id = "div_graph";
    element.append(div_graph);

    var buylist = stock.buylist;
    if(buylist.length === 0) {
        return;
    }

    var data = new google.visualization.DataTable();
    data.addColumn('string', "time");
    data.addColumn('number', "거래대금");
    data.addColumn('number', "등락률");

    var dataTable = [];
    for(var i=0; i<buylist.length; i++)
    {
        dataTable.push([buylist[i].time, buylist[i].netaskval, parseFloat(buylist[i].stockinfo ?  buylist[i].stockinfo.updn_rate : 0)]);
    }

    data.addRows(dataTable);

    var buy = buylist[buylist.length - 1];
    var title = stock.isu_nm;
    var options = {
        title: title,
        vAxis: {
        },
        hAxis: {
            maxValue: 1600,
            minTextSpacing: 100
        },
        series: {
            0: {targetAxisIndex: 0},
            1: {targetAxisIndex: 1}
        },
        colors: ['#a52714', '#097138'],
        legend: {
            position: 'none',
            alignment: 'start',
            textStyle: {
                color: 'blue',
                fontSize: 16
            }
        }
    };

    var chart = new google.visualization.LineChart(div_graph);
    chart.draw(data, options);
}

function makeDetailPage(chartTarget, tableTarget, stock)
{
    makeChart(chartTarget, stock);
    makeDetailTable(tableTarget, stock);
}