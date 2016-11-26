var _tradingData = null;

$(document).ready(function (){
    //init();
});

$(window).load( function() {
    init();
});

function init() {
    chartInit(function() {
        console.log('chart init');
        getTrading();
    });
}

function refreshData(tradingData)
{
    var chart = document.getElementById('detail_chart_div');
    var tbody = $(document).find("#tbody_trading_detail_container");
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