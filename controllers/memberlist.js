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

}

function addMember(req, res) {

}

function deleteMember(req, res) {

}
