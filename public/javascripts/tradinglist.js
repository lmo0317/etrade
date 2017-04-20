var _tradingData = null;

$(document).ready(function (){
    init();
});

function init() {

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

function makeTradeTable(parameter, data) {

    data.forEach(function(stock) {

        var tr = $("<tr>").attr("id", "tr_trading_list");
        var td_name = $("<td>").attr("id", "td_name");
        td_name.text(stock.isu_nm);

        var stockInfo = stock.buylist[stock.buylist.length - 1].stockinfo;
        var updn_rate = numberWithCommas((stockInfo && stockInfo.updn_rate) || 0); //등락률
        var td_trading_updn_rate = $("<td>").attr("id", "td_trading_updn_rate");
        td_trading_updn_rate.text(updn_rate);

        //순매수
        var td_trading_netaskval = $("<td>").attr("id", "td_trading_netaskval");
        var netaskval = numberWithCommas(stock.buylist[stock.buylist.length - 1].netaskval);
        td_trading_netaskval.text(netaskval);

        //거래대금
        var isu_tr_amt = (stockInfo && stockInfo.isu_tr_amt) || 0;
        var td_trading_isu_tr_amt = $("<td>").attr("id", "td_trading_isu_tr_amt");
        td_trading_isu_tr_amt.text(isu_tr_amt);

        //거래량
        var isu_tr_vl = (stockInfo && stockInfo.isu_tr_vl) || 0;
        var td_trading_isu_tr_vl = $("<td>").attr("id", "td_trading_isu_tr_vl");
        td_trading_isu_tr_vl.text(isu_tr_vl);

        //버튼 추가
        var td_button = $("<td>").attr("id", "td_button");

        //detail 버튼 추가
        createDetailButton(stock, td_button);

        //delete 버튼 추가
        /*
        createDeleteButton(stock, td_button);

        var td_grade = $("<td>").attr("id", "td_grade").attr("width", "120");
        var input_grade = $("<input>").attr("id", "input_grade")
                                        .attr("type", "number")
                                        .attr("value", stock.grade)
                                        .attr("min", "1")
                                        .attr("max", "3")
                                        .attr("class", "form-control");
        td_grade.append(input_grade);
        input_grade.bootstrapNumber({
            up: function(value) {
                console.log(value);
                editTrading(stock, value);
            },
            down: function(value) {
                console.log(value);
                editTrading(stock, value);
            }
        });
        */

        /*
        input_grade.onLoad(function() {
            console.log('onLoad');
            console.log(input_grade);
        });
        */
        //td_grade.text(stock.grade || 0);

        tr.append(td_name);
        tr.append(td_trading_updn_rate); //등락률
        tr.append(td_trading_netaskval); //순매수
        tr.append(td_trading_isu_tr_amt); //거래 대금
        tr.append(td_trading_isu_tr_vl); //거래량
        //tr.append(td_grade);
        tr.append(td_button);
        $("#tbody_trading_container").append(tr);
    });
}

function addButton() {

    $("#btn_search").click(function(){
        getTradingList();
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

function editTrading(stock, value)
{
    $.ajax({
        url: '/trading',
        type: 'put',
        data: {
            start: $("#edit_start").val(),
            isu_nm: stock.isu_nm,
            grade: value
        },
        success:function(data) {
            console.log('complete edit trading');
        },
        error:function(err) {
            console.log(err);
            alert(err.responseText);
        }
    });
}

function clickDeleteButton(stock) {
    deleteStock(stock, function() {
        getTradingList();
    });
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