/**
 * Created by LEE-DESKTOP on 2016-11-22.
 */

function chartInit(callback)
{
    google.charts.load('current', {'packages':['line', 'corechart']});
    google.charts.setOnLoadCallback(callback);
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

function makeTradeTable(parameter, data) {

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
        if( parameter.exception ) {
            netaskval = numberWithCommas(value.buylist[value.buylist.length - 1].netaskvalhidden);
        } else {
            netaskval = numberWithCommas(value.buylist[value.buylist.length - 1].netaskval);
        }
        td_trading_netaskval.text(netaskval);

        var td_button = $("<td>").attr("id", "td_button");

        //detail 버튼 추가
        createDetailButton(parameter, value, td_button);

        //add button 추가
        //createAddButton(td_button);

        tr.append(td_name);
        tr.append(td_trading_updn_rate);
        tr.append(td_trading_netaskval);
        tr.append(td_button);
        $("#tbody_trading_container").append(tr);
    });
}

function createDetailButton(parameter, value, td_button)
{
    var button_detail = $("<input>")
        .attr("type", "button")
        .attr("id", "btn_detail" )
        .attr("class", "btn btn-danger")
        .val('DETAIL');
    button_detail.click(function() {
        clickDetailButton(parameter, value);
    });
    td_button.append(button_detail);
}

function createAddButton(td_button)
{
    //add 버튼 추가
    var button_add = $("<input>")
        .attr("type", "button")
        .attr("id", "btn_add")
        .attr("class", "btn btn-primary")
        .val('ADD');
    button_add.click(function () {
        clickAddButton(value.isu_nm);
    });
    td_button.append(button_add);
}

function clickDetailButton(parameter, stock) {
    if(stock.buylist.length <= 0) return;
    var pop = window.open('detailtrading.html');
    pop.onload = function() {
        var title = $(pop.document).find("#modal-title");
        title.text = stock.isu_nm;

        var isu_nm = $(pop.document).find("#isu_nm");
        isu_nm.val(stock.isu_nm);

        var edit_start = $(pop.document).find("#edit_start");
        edit_start.val(parameter.edit_start);
    };
}

function clickAddButton(isu_nm) {
    $.ajax({
        url: '/stock/favorite',
        type: 'post',
        data: {
            isu_nm: isu_nm
        },
        success:function(data) {
            console.log(data);
            alert('add complete');
        },
        error:function() {
            alert('error');
        }
    });
}

function makeChart(element, stock)
{
    stock = deepCopy(stock);
    convertProperData('chart', stock);
    console.log(stock);

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

function convertProperData(type, stock)
{
    //장마감 시간 이상 데이터가 올경우 걸러 낸다.
    var buylist = [];
    for(var i = 0;i<stock.buylist.length;i++) {
        if(stock.buylist[i].time <= 1600) {
            buylist.push(stock.buylist[i]);
        }
    }

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
