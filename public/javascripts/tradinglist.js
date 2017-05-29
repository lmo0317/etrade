var _tradingData = null;

$(document).ready(function (){
    init();
});

function init()
{
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

function refreshData(data)
{
    var container = $("#tbody_trading_container");
    makeTradeTable(data, container, "detail");
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

function addButton() {

    $("#btn_search").click(function(){
        getTradingList();
    });
}