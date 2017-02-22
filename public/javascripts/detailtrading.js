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
        //setInterval(process, 1000 * 60);

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
    if(!tradingData) {
        $("#edit_start").val(moment().format("YYMMDD"));
        return;
    }

    $("#edit_start").val(tradingData.date.substr(2,6));
    makeDetailPage(tradingData);
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

function addFavoritStock()
{
    $.ajax({
        url: '/stock/favorite',
        type: 'post',
        data: {
            isu_nm: $("#isu_nm").val()
        },
        success:function(data) {
            alert('complete add favorite stock');
        },
        error:function() {
            alert('error');
        }
    });
}

function findTrading()
{
    $.ajax({
        url: '/trading/find',
        type: 'post',
        data: {
            start: $("#edit_start").val(),
            isu_nm: $("#isu_nm").val()
        },
        success:function(data) {
            alert('complete find trading');
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

    $("#btn_add_favorite").click(function() {
        addFavoritStock();
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
        td_trading_netaskval.text(numberWithCommas(buy.netaskval));

        tr.append(td_time);
        tr.append(td_trading_updn_rate);
        tr.append(td_trading_netaskval);
        tableTarget.append(tr);
    });
}

function makeMemberChart(element, stock, type)
{
    var selectiveValue = {
        sell: {
            title: '매도 상위',
            color: 'blue',
            sortkey: 'askval'
        },
        buy: {
            title: '매수 상위',
            color: 'red',
            sortkey: 'bidval'
        }
    };

    //stock이 오염되지 않게 deepcopy
    stock = deepCopy(stock);
    
    //member_chart에 적절하게 변환
    convertProperData('member_chart', stock);

    //그래프 전용 div 생성
    var div_graph = document.createElement("div");
    div_graph.id = "div_graph";
    element.append(div_graph);

    //memberlist 얻어온다.
    var memberlist = stock.memberlist;

    //type에 맞는 정렬방식 (매도기준, 매수 기준) 으로 정렬 한뒤 상위 5개만 추린다.
    memberlist = memberlist.sort(function(lhs, rhs) {
        return parseInt(rhs[selectiveValue[type].sortkey].replace(/,/g, ""),10) - parseInt(lhs[selectiveValue[type].sortkey].replace(/,/g, ""),10);
    }).splice(0,5);

    //data 세팅
    var dataTable = [];
    var data = new google.visualization.DataTable();
    data.addColumn('string', "기관");
    data.addColumn('number', "거래대금");
    for(var i=0; i<memberlist.length; i++)
    {
        var val = memberlist[i][selectiveValue[type].sortkey].replace(/,/g, "");
        dataTable.push([memberlist[i].mbr_nm, parseInt(val,10)]);
    }
    data.addRows(dataTable);

    //option 설정
    var title = selectiveValue[type].title;
    var options = {
        title: title,
        colors: [selectiveValue[type].color]
    };

    //차트 생성
    var chart = new google.visualization.ColumnChart(div_graph);
    chart.draw(data, options);
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

function makeDetailPage(stock)
{
    var chart = $("#detail_chart_div");
    var memberChartBuy = $("#member_chart_buy_div");
    var memberChartSell = $("#member_chart_sell_div");
    var tbody = $("#tbody_trading_detail_container");

    chart.html('');
    memberChartBuy.html('');
    memberChartSell.html('');
    tbody.html('');

    makeChart(chart, stock);
    makeMemberChart(memberChartBuy, stock, 'sell');
    makeMemberChart(memberChartSell, stock, 'buy');
    makeDetailTable(tbody, stock);
}