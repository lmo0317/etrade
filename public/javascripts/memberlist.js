$(document).ready(function (){
    init();
});

function deleteMember(mbr_nm) {
    console.log(mbr_nm);

    $.ajax({
        url: '/member',
        type: 'delete',
        data: {
            mbr_nm: mbr_nm
        },
        success: function (data) {
            console.log(data);
            location.reload();
        },
        error: function (err) {
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
                var td_name = $("<td>").attr("id", "td_name").attr('width','80%');
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
