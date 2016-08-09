$(document).ready(function (){
    init();
});

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

                for(var i=0;i<data.length;i++) {
                    var value = data[i];

                    var tr = $("<tr>").attr("id", "tr_trading_list");
                    var td_name = $("<td>").attr("id", "td_name");
                    td_name.text(value.isu_nm);

                    var td_trading = $("<td>").attr("id", "td_trading");
                    td_trading.text(value.trade);

                    tr.append(td_name);
                    tr.append(td_trading);
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
