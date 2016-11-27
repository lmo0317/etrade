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
            console.log(data);
            alert('add complete');
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
            _tradingData = data;
            refreshData(_tradingData);
        },
        error:function(err) {
            console.log(err);
            alert(err.responseText);
        }
    });
}

function editTrading()
{
    $.ajax({
        url: '/trading',
        type: 'put',
        data: {
            start: $("#edit_start").val(),
            isu_nm: $("#isu_nm").val(),
            grade: $("#grade").val()
        },
        success:function(data) {
            alert('complete edit trading');
            _tradingData = data;
            refreshData(_tradingData);
        },
        error:function(err) {
            console.log(err);
            alert(err.responseText);
        }
    });
}

$(window).load( function() {
    init();
});

function init() {
    addButton();
}

function addButton() {
    $("#btn_edit").click(function(){
        editTrading();
    });

    $("#btn_find").click(function(){
        findTrading();
    });

    $("#btn_add_favorite").click(function() {
        console.log('add favorite stock');
        addFavoritStock();
    });
}