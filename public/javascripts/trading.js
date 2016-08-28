$(document).ready(function (){
    init();
});

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

function clickButtonDetail() {
    //전체 테이블 추가
    
    $("#modal-body").html('123');
}

function getTrading() {

    $("#btn_search").click(function(){
        $.ajax({
            url: '/trading',
            type: 'get',
            data: {
                start: $("#edit_start").val()
            },
            success:function(data) {
                console.log(data);
                $("#tbody_trading_container").html('');

                for(var i = 0 ;i < data.length; i++) {
                    var value = data[i];

                    var tr = $("<tr>").attr("id", "tr_trading_list");
                    var td_name = $("<td>").attr("id", "td_name");
                    td_name.text(value.isu_nm);

                    var td_trading = $("<td>").attr("id", "td_trading");
                    td_trading.text(getLatestTrading(value.trade));

                    var td_detail_button = $("<td>").attr("id", "td_detail_button");
                    var button_detail = $("<input>")
                                            .attr("type", "button")
                                            .attr("id", "btn_detail" )
                                            .attr("class", "btn btn-danger")
                                            .attr("data-toggle", "modal")
                                            .attr("data-target", "#myModal")
                                            .val('DETAIL');

                    button_detail.click(function() {
                        clickButtonDetail();
                    });


                    tr.append(td_name);
                    tr.append(td_trading);
                    tr.append(td_detail_button.append(button_detail));
                    $("#tbody_trading_container").append(tr);
                }
            },
            error:function() {
                alert('error');
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
