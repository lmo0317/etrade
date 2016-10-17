var _tradingData = null;

$(document).ready(function (){
    init();

    $('input:checkbox[name=check_box_exception_top]').on( {
        click: function(e) {
            console.log('click');
        },
        change: function(e) {
            console.log('change');
            makeTradeTable(_tradingData);
        }
    });

    new Tablesort(document.getElementById('sort'));
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getAccumlateTrading(tradelist) {
    var accumlate = 0;
    Object.keys(tradelist).forEach(function(key) {
        accumlate = tradelist[key];
    });
    return accumlate;
}

function getLatestTrading(tradelist) {

    var maxKey = 0;
    Object.keys(tradelist).forEach(function(key) {
        if(key >= maxKey) {
            maxKey = key;
        }
    });

    console.log(tradelist[maxKey]);
    return tradelist[maxKey];
}

function clickButtonDetail(buylist) {
    
    console.log(buylist);
    $("#tbody_trading_detail_container").html('');
    buylist.forEach(function(buy) {
        
        //tr 추가
        var tr = $("<tr>").attr("id", "tr_trading_list");
        
        //time
        var td_time = $("<td>").attr("id", "td_name");
        td_time.text(buy.time);

        var td_trading_updn_rate = $("<td>").attr("id", "td_trading_updn_rate");
        var updn_rate = numberWithCommas((buy.stockinfo && buy.stockinfo.updn_rate) || 0);
        td_trading_updn_rate.text(updn_rate);

        //trading
        var td_trading_netaskval = $("<td>").attr("id", "td_trading_netaskval");
        if( $('input:checkbox[name=check_box_exception_top]').is(':checked') ) {
            td_trading_netaskval.text(numberWithCommas(buy.netaskvalhidden));
        } else {
            td_trading_netaskval.text(numberWithCommas(buy.netaskval));
        }

        var td_trading_netaskvol = $("<td>").attr("id", "td_trading_netaskvol");
        if( $('input:checkbox[name=check_box_exception_top]').is(':checked') ) {
            td_trading_netaskvol.text(numberWithCommas(buy.netaskvolhidden));
        } else {
            td_trading_netaskvol.text(numberWithCommas(buy.netaskvol));
        }

        tr.append(td_time);
        tr.append(td_trading_updn_rate);
        tr.append(td_trading_netaskval);
        tr.append(td_trading_netaskvol);
        $("#tbody_trading_detail_container").append(tr);
    });
}

function makeTradeTable(data) {

    $("#tbody_trading_container").html('');

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
        if( $('input:checkbox[name=check_box_exception_top]').is(':checked') ) {
            netaskval = numberWithCommas(value.buylist[value.buylist.length - 1].netaskvalhidden);
        } else {
            netaskval = numberWithCommas(value.buylist[value.buylist.length - 1].netaskval);
        }
        td_trading_netaskval.text(netaskval);

        var td_trading_netaskvol = $("<td>").attr("id", "td_trading_netaskvol");
        var netaskvol = 0;
        if( $('input:checkbox[name=check_box_exception_top]').is(':checked')) {
            netaskvol = numberWithCommas(value.buylist[value.buylist.length - 1].netaskvolhidden);
        } else {
            netaskvol = numberWithCommas(value.buylist[value.buylist.length - 1].netaskvol);
        }
        td_trading_netaskvol.text(netaskvol);

        var td_detail_button = $("<td>").attr("id", "td_detail_button");
        var button_detail = $("<input>")
            .attr("type", "button")
            .attr("id", "btn_detail" )
            .attr("class", "btn btn-danger")
            .attr("data-toggle", "modal")
            .attr("data-target", "#myModal")
            .val('DETAIL');

        button_detail.click(function() {
            clickButtonDetail(value.buylist);
        });


        tr.append(td_name);
        tr.append(td_trading_updn_rate);
        tr.append(td_trading_netaskval);
        tr.append(td_trading_netaskvol);
        tr.append(td_detail_button.append(button_detail));
        $("#tbody_trading_container").append(tr);
    });
}

function getTrading() {

    $("#btn_search").click(function(){
        console.log($("#type"));
        console.log($("#type").val());

        $.ajax({
            url: '/trading',
            type: 'get',
            data: {
                start: $("#edit_start").val(),
                type: $("#type").val()
            },
            success:function(data) {
                _tradingData = data;
                alert('complete');
                makeTradeTable(data);
            },
            error:function(err) {
                console.log(err);
                alert(err.responseText);
            }
        });
    });

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
}

function init() {
    getTrading();
}
