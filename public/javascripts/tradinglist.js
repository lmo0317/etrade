var _tradingData = null;

$(document).ready(function (){
    init();
});

function init() {

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

    $('input:checkbox[name=check_box_exception_top]').on( {
        click: function(e) {
            console.log('click');
        },
        change: function(e) {
            console.log('change');
            refreshData(_tradingData);
        }
    });

    addSearchButton();
    new Tablesort(document.getElementById('sort'));
}

function refreshData(tradingData)
{
    makeTradeTableProcess(tradingData);
}

function makeTradeTableProcess(data)
{
    $("#tbody_trading_container").html('');

    var parameter = {
        exception: $('input:checkbox[name=check_box_exception_top]').is(':checked'),
        edit_start: $("#edit_start").val()
    };

    makeTradeTable(parameter, data);
}

function addSearchButton() {

    $("#btn_search").click(function(){
        $.ajax({
            url: '/tradinglist',
            type: 'get',
            data: {
                start: $("#edit_start").val(),
                type: $("#type").val()
            },
            success:function(data) {
                _tradingData = data;
                alert('complete');
                refreshData(_tradingData);
            },
            error:function(err) {
                console.log(err);
                alert(err.responseText);
            }
        });
    });
}