var _tradingData = null;

$(document).ready(function (){
    init();
});

function init() {

    setInterval(process, 1000 * 60);

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

    addButton();
    new Tablesort(document.getElementById('sort'));
}

function process()
{
    getTradingList();
    console.log('process');
}

function refreshData(tradingData)
{
    makeTradeTableProcess(tradingData);
}

function makeTradeTableProcess(data)
{
    $("#tbody_trading_container").html('');

    var parameter = {
        exception: $('input:checkbox[name=check_box_exception_top]').is(':checked')
    };

    makeTradeTable(parameter, data);
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

function makeTradeTable(parameter, data) {

    data.forEach(function(stock) {

        var tr = $("<tr>").attr("id", "tr_trading_list");
        var td_name = $("<td>").attr("id", "td_name");
        td_name.text(stock.isu_nm);

        var td_trading_updn_rate = $("<td>").attr("id", "td_trading_updn_rate");
        var stockInfo = stock.buylist[stock.buylist.length - 1].stockinfo;
        var updn_rate = numberWithCommas((stockInfo && stockInfo.updn_rate) || 0);
        td_trading_updn_rate.text(updn_rate);

        var td_trading_netaskval = $("<td>").attr("id", "td_trading_netaskval");
        var netaskval = 0;
        if( parameter.exception ) {
            netaskval = numberWithCommas(stock.buylist[stock.buylist.length - 1].netaskvalhidden);
        } else {
            netaskval = numberWithCommas(stock.buylist[stock.buylist.length - 1].netaskval);
        }
        td_trading_netaskval.text(netaskval);

        var td_button = $("<td>").attr("id", "td_button");

        //detail 버튼 추가
        createDetailButton(stock, td_button);

        //edit 버튼 추가
        createEditButton(stock, td_button);
        
        //delete 버튼 추가
        createDeleteButton(stock, td_button);

        var td_grade = $("<td>").attr("id", "td_grade").attr("width", "120");
        var input_grade = $("<input>").attr("id", "after")
                                        .attr("type", "number")
                                        .attr("value", stock.grade)
                                        .attr("min", "1")
                                        .attr("max", "3")
                                        .attr("class", "form-control");
        td_grade.append(input_grade);
        input_grade.bootstrapNumber();

        //td_grade.text(stock.grade || 0);

        tr.append(td_name);
        tr.append(td_trading_updn_rate);
        tr.append(td_trading_netaskval);
        tr.append(td_grade);
        tr.append(td_button);
        $("#tbody_trading_container").append(tr);
    });
}

function createDeleteButton(stock, td_button)
{
    var button_delete = $("<input>")
        .attr("type", "button")
        .attr("id", "btn_edit" )
        .attr("class", "btn btn-danger")
        .attr("style", "margin-left: 10px")
        .val('DELETE');
    button_delete.click(function() {
        clickDeleteButton(stock);
    });
    td_button.append(button_delete);
}

function createEditButton(stock, td_button)
{
    var button_edit = $("<input>")
        .attr("type", "button")
        .attr("id", "btn_edit" )
        .attr("class", "btn btn-primary")
        .attr("style", "margin-left: 10px")
        .val('EDIT');
    button_edit.click(function() {
        clickEditButton(stock);
    });
    td_button.append(button_edit);
}

function createDetailButton(stock, td_button)
{
    var button_detail = $("<input>")
        .attr("type", "button")
        .attr("id", "btn_detail" )
        .attr("class", "btn btn-primary")
        .val('DETAIL');
    button_detail.click(function() {
        clickDetailButton(stock);
    });
    td_button.append(button_detail);
}

function deleteStock(stock, callback) {
    $.ajax({
        url: '/trading',
        type: 'delete',
        data: {
            start: $("#edit_start").val(),
            isu_nm: stock.isu_nm
        },
        success: function (data) {
            alert('complete edit trading');
            callback();
        },
        error: function (err) {
            console.log(err);
            alert(err.responseText);
            callback();
        }
    });
}

function clickDeleteButton(stock) {
    deleteStock(stock, function() {
        getTradingList();
    });
}

function clickEditButton(stock) {
    if(stock.buylist.length <= 0) return;
    var pop = window.open('edittrading.html');
    pop.onload = function() {
        var title = $(pop.document).find("#modal-title");
        title.text = stock.isu_nm;

        var isu_nm = $(pop.document).find("#isu_nm");
        isu_nm.val(stock.isu_nm);

        var edit_start = $(pop.document).find("#edit_start");
        edit_start.val($("#edit_start").val());
    };
}

function clickDetailButton(stock) {
    if(stock.buylist.length <= 0) return;
    var pop = window.open('detailtrading.html');
    pop.onload = function() {
        var title = $(pop.document).find("#modal-title");
        title.text = stock.isu_nm;

        var isu_nm = $(pop.document).find("#isu_nm");
        isu_nm.val(stock.isu_nm);

        var edit_start = $(pop.document).find("#edit_start");
        edit_start.val($("#edit_start").val());
    };
}