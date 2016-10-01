$(document).ready(function (){
    init();
});

function deleteStock(isu_srt_cd) {
    console.log(isu_srt_cd);

    $.ajax({
        url: '/stock',
        type: 'delete',
        data: {
            isu_srt_cd: isu_srt_cd
        },
        success: function (data) {
            console.log(data);
            location.reload();
        },
        error: function () {
            alert('error');
        }
    });
}

function registerAddStock() {

    $("#btn_add").click(function(){
        $.ajax({
            url: '/stock/favorite',
            type: 'post',
            data: {
                isu_nm: $("#add_input_name").val()
            },
            success:function(data) {
                console.log(data);
                location.reload();
            },
            error:function() {
                alert('error');
            }
        });
    });
}

function getFavoriteStockList() {
    $.ajax({
        url: '/stocklist/favorite',
        type: 'get',
        success: function (data) {

            $("#tbody_container").html('');
            data.forEach(function(stock) {
                var tr = $("<tr>").attr("id", "tr_stock");
                var td_name = $("<td>").attr("id", "td_name").attr('width','80%');
                td_name.text(stock.isu_nm);

                var button_delete = $("<input>")
                    .attr("type", "button")
                    .attr("id", "btn_delete" )
                    .attr("class", "btn btn-danger")
                    .val('DELETE');

                button_delete.click(function() {
                    deleteStock(stock.isu_srt_cd);
                });

                tr.append(td_name);
                tr.append(button_delete);
                $("#tbody_container").append(tr);
            });
        },
        error: function () {
            alert('error');
        }
    });
}

function init() {
    getFavoriteStockList();
    registerAddStock();
}
