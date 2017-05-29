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
    var name = "#tbody_trading_" + type + "_container";
    var container = $(name);
    console.log(type);
    makeTradeTable(data, container, type=="favorite" ? "detail" : "simple", $("#edit_start").val());
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