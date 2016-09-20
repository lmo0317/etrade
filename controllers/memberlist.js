/**
 * Created by LEE-DESKTOP on 2016-09-03.
 */
var memberlistService = require('../service/memberlist');

exports.delegate = function(app) {
    console.info('memberlist delegate');
    app.get('/memberlist', getMemberList);
    app.post('/member', addMember);
    app.delete('/member', deleteMember);
};

function getMemberList(req, res) {
    memberlistService.getMemberList(function(err, result) {
        if(err) return res.send({result: false});
        res.send(result);
    });
}

function addMember(req, res) {
    var member = {
        mbr_nm: req.body.mbr_nm
    };

    memberlistService.addMember(member, function(err, result) {
        if(err) return res.send({result:false});
        res.send(result);
    });
}

function deleteMember(req, res) {

}