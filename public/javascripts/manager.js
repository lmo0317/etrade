/**
 * Created by LEE-DESKTOP on 2016-12-14.
 */

$(document).ready(function (){
    init();
});

function init() {
    getManagerSetting();
    registerUpdateButton();
}

function registerUpdateButton() {

    $("#btn_submit").click(function() {
        console.log('btn_submit');
        var data = {
            "grade": {
                "1": $("#grade1").val(),
                "2": $("#grade2").val(),
                "3": $("#grade3").val()
            },
            "favorite": $("#favorite").val()
        };

        console.log(data);
        $.ajax({
            url: '/manager/setting',
            type: 'post',
            data: {cron: JSON.stringify(data)},
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

function getManagerSetting() {
    $.ajax({
        url: '/manager/setting',
        type: 'get',
        success: function (data) {
            console.log(data);
            $("#grade1").val(data.cron.grade[1]);
            $("#grade2").val(data.cron.grade[2]);
            $("#grade3").val(data.cron.grade[3]);
            $("#favorite").val(data.cron.favorite);
        },
        error: function () {
            alert('error');
        }
    });
}