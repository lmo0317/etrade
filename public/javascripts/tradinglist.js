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
        exception: $('input:checkbox[name=check_box_exception_top]').is(':checked'),
        edit_start: $("#edit_start").val()
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

        //edit 버튽 추가
        createEditButton(parameter, value, td_button);

        var td_grade = $("<td>").attr("id", "td_grade");
        td_grade.text(value.grade || 0);

        tr.append(td_name);
        tr.append(td_trading_updn_rate);
        tr.append(td_trading_netaskval);
        tr.append(td_grade);
        tr.append(td_button);
        $("#tbody_trading_container").append(tr);
    });
}

function createDeleteButton(parameter, value, td_button)
{
    var button_delete = $("<input>")
        .attr("type", "button")
        .attr("id", "btn_edit" )
        .attr("class", "btn btn-primary")
        .attr("style", "margin-left: 10px")
        .val('EDIT');
    button_delete.click(function() {
        clickEditButton(parameter, value);
    });
    td_button.append(button_delete);
}

function createEditButton(parameter, value, td_button)
{
    var button_edit = $("<input>")
        .attr("type", "button")
        .attr("id", "btn_edit" )
        .attr("class", "btn btn-primary")
        .attr("style", "margin-left: 10px")
        .val('EDIT');
    button_edit.click(function() {
        clickEditButton(parameter, value);
    });
    td_button.append(button_edit);
}

function createDetailButton(parameter, value, td_button)
{
    var button_detail = $("<input>")
        .attr("type", "button")
        .attr("id", "btn_detail" )
        .attr("class", "btn btn-primary")
        .val('DETAIL');
    button_detail.click(function() {
        clickDetailButton(parameter, value);
    });
    td_button.append(button_detail);
}

function clickDeleteButton(parameter, stock) {

}

function clickEditButton(parameter, stock) {
    if(stock.buylist.length <= 0) return;
    var pop = window.open('edittrading.html');
    pop.onload = function() {
        var title = $(pop.document).find("#modal-title");
        title.text = stock.isu_nm;

        var isu_nm = $(pop.document).find("#isu_nm");
        isu_nm.val(stock.isu_nm);

        var edit_start = $(pop.document).find("#edit_start");
        edit_start.val(parameter.edit_start);
    };
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