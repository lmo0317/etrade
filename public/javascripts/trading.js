var _tradingData = null;

$(document).ready(function (){
    init();

    $('input:checkbox[name=check_box_exception_top]').on( {
        click: function(e) {
            console.log('click');
        },
        change: function(e) {
            console.log('change');
            if($('input:checkbox[name=check_box_graph]').is(':checked')) {
                makeCharts(document.getElementById('chart_div'), _tradingData.slice(0,10));
            } else {
                makeTradeTable(_tradingData);
            }
        }
    });

    $('input:checkbox[name=check_box_graph]').on( {
        click: function(e) {
            console.log('click');
        },
        change: function(e) {
            console.log('change', e);
            if(e.target.checked) {
                makeCharts(document.getElementById('chart_div'), _tradingData.slice(0,10));
            } else {
                makeTradeTable(_tradingData);
            }
        }
    });

    new Tablesort(document.getElementById('sort'));
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getAccumlateTrading(tradelist) {
    var accumlate = 0;
    Object.keys(tradelist).forEach(function(key) {
        accumlate = tradelist[key];
    });
    return accumlate;
}

function getLatestTrading(tradelist) {

    var maxKey = 0;
    Object.keys(tradelist).forEach(function(key) {
        if(key >= maxKey) {
            maxKey = key;
        }
    });

    console.log(tradelist[maxKey]);
    return tradelist[maxKey];
}

function clickButtonDetail(stock) {
    $("#detail_chart_div").html('');
    $("#tbody_trading_detail_container").html('');

    if(stock.buylist.length <= 0) return;

    makeChart(document.getElementById('detail_chart_div'), stock);
    var buy = stock.buylist[stock.buylist.length - 1];

    //tr 추가
    var tr = $("<tr>").attr("id", "tr_trading_list");

    var td_trading_updn_rate = $("<td>").attr("id", "td_trading_updn_rate");
    var updn_rate = numberWithCommas((buy.stockinfo && buy.stockinfo.updn_rate) || 0);
    td_trading_updn_rate.text(updn_rate);

    //trading
    var td_trading_netaskval = $("<td>").attr("id", "td_trading_netaskval");
    if( $('input:checkbox[name=check_box_exception_top]').is(':checked') ) {
        td_trading_netaskval.text(numberWithCommas(buy.netaskvalhidden));
    } else {
        td_trading_netaskval.text(numberWithCommas(buy.netaskval));
    }

    tr.append(td_trading_updn_rate);
    tr.append(td_trading_netaskval);
    $("#tbody_trading_detail_container").append(tr);
}

function makeTradeTable(data) {

    $("#tbody_trading_container").html('');
    $("#chart_div").html('');
    $("#sort_table").show();

    //상위 5개 ~ 10개 정도만 추린다.
    //var stocks = data.splice(0,10);
    //makeChart(document.getElementById('chart_div'), stocks);

    data.forEach(function(value) {
        var tr = $("<tr>").attr("id", "tr_trading_list");
        var td_name = $("<td>").attr("id", "td_name");
        td_name.text(value.isu_nm);

        var td_trading_updn_rate = $("<td>").attr("id", "td_trading_updn_rate");
        var stockInfo = value.buylist[value.buylist.length - 1].stockinfo;
        var updn_rate = numberWithCommas((stockInfo && stockInfo.updn_rate) || 0);
        td_trading_updn_rate.text(updn_rate);

        var td_trading_netaskval = $("<td>").attr("id", "td_trading_netaskval");
        var netaskval = 0;
        if( $('input:checkbox[name=check_box_exception_top]').is(':checked') ) {
            netaskval = numberWithCommas(value.buylist[value.buylist.length - 1].netaskvalhidden);
        } else {
            netaskval = numberWithCommas(value.buylist[value.buylist.length - 1].netaskval);
        }
        td_trading_netaskval.text(netaskval);

        var td_button = $("<td>").attr("id", "td_button");

        //detail 버튼 추가
        var button_detail = $("<input>")
            .attr("type", "button")
            .attr("id", "btn_detail" )
            .attr("class", "btn btn-danger")
            .attr("data-toggle", "modal")
            .attr("data-target", "#myModal")
            .val('DETAIL');

        button_detail.click(function() {
            clickButtonDetail(value);
        });

        td_button.append(button_detail);

        //favorite에서는 add버튼 추가하지 않는다.
        if($("#type").val() !== 'favorite') {

            //add 버튼 추가
            var button_add = $("<input>")
                .attr("type", "button")
                .attr("id", "btn_add")
                .attr("class", "btn btn-primary")
                .val('ADD');

            button_add.click(function () {
                clickButtonAdd(value.isu_nm);
            });

            td_button.append(button_add);
        }

        tr.append(td_name);
        tr.append(td_trading_updn_rate);
        tr.append(td_trading_netaskval);
        tr.append(td_button);
        $("#tbody_trading_container").append(tr);
    });
}

function makeCharts(element, stocks)
{
    $("#tbody_trading_container").html('');
    $("#chart_div").html('');
    $("#sort_table").hide();

    stocks.forEach(function(stock) {
       makeChart(element, stock);
    });
}

function makeChart(element, stock)
{
    var div_graph = document.createElement("div");
    div_graph.id = "div_graph";
    element.append(div_graph);

    //장마감 시간 이상 데이터가 올경우 걸러 낸다.
    var buylist = [];
    for(var i = 0;i<stock.buylist.length;i++) {
        if(stock.buylist[i].time <= 1600) {
            buylist.push(stock.buylist[i]);
        }
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

    var options = {
        title: stock.isu_nm,
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
        width: 900,
        height: 500,
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

function getTrading() {

    $("#btn_search").click(function(){
        console.log($("#type").val());

        $.ajax({
            url: '/trading',
            type: 'get',
            data: {
                start: $("#edit_start").val(),
                type: $("#type").val()
            },
            success:function(data) {
                _tradingData = data;
                alert('complete');
                makeTradeTable(data);
            },
            error:function(err) {
                console.log(err);
                alert(err.responseText);
            }
        });
    });

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
}

function clickButtonAdd(isu_nm) {
    $.ajax({
        url: '/stock/favorite',
        type: 'post',
        data: {
            isu_nm: isu_nm
        },
        success:function(data) {
            console.log(data);
            alert('add complete');
            //location.reload();
        },
        error:function() {
            alert('error');
        }
    });
}

function init() {
    google.charts.load('current', {'packages':['line', 'corechart']});
    google.charts.setOnLoadCallback(onLoadCallback);
    getTrading();
}

function onLoadCallback()
{
    console.log('OnLoadCallback');
}