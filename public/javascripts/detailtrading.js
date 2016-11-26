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

function findTrading()
{
    $.ajax({
        url: '/trading',
        type: 'post',
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