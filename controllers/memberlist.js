/**
 * Created by LEE-DESKTOP on 2016-09-03.
 */
var memberlistlib = require('../lib/memberlist');

exports.delegate = function(app) {
    console.info('memberlist delegate');
    app.get('/memberlist', getMemberList);
    app.post('/member', addMember);
    app.delete('/member', deleteMember);
};

function getMemberList(req, res) {
    memberlistlib.getMemberList(function(err, result) {
        if(err) return res.send({result: false});
        res.send(result);
    });
}

function addMember(req, res) {
    var member = {
        mbr_nm: req.body.mbr_nm
    };

    memberlistlib.addMember(member, function(err, result) {
        if(err) return res.send({result:false});
        res.send(result);
    });
}

function deleteMember(req, res) {
    var mbr_nm = req.body.mbr_nm;

    memberlistlib.deleteMember(mbr_nm, function(err, result) {
        if(err) return res.send({result: false});
        res.send({result: true});
    });
}