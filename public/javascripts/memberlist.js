$(document).ready(function (){
    init();
});

function deleteMember(isu_srt_cd) {
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

function getMember() {
    $.ajax({
        url: '/memberlist',
        type: 'get',
        success: function (data) {

            console.log(data);

            $("#tbody_container").html('');
            data.forEach(function(member) {
                var tr = $("<tr>").attr("id", "tr_member");
                var td_name = $("<td>").attr("id", "td_name");
                td_name.text(member.mbr_nm);

                var button_delete = $("<input>")
                    .attr("type", "button")
                    .attr("id", "btn_delete" )
                    .attr("class", "btn btn-danger")
                    .val('DELETE');

                button_delete.click(function() {
                    deleteMember(member.mbr_nm);
                });

                tr.append(td_name);
                tr.append(button_delete);
                $("#tbody_container").append(tr);
            });
        },
        error: function (err) {
            console.log(err);
            alert(err);
        }
    });
}

function registerMemberStock() {

    $("#btn_add").click(function(){
        $.ajax({
            url: '/member',
            type: 'post',
            data: {
                mbr_nm: $("#add_input_name").val()
            },
            success:function(data) {
                console.log(data);
                location.reload();
            },
            error:function(err) {
                console.log(err);
            }
        });
    });
}

function getMemberlist() {
    getMember();
}

function init() {
    getMemberlist();
    registerMemberStock();
}
