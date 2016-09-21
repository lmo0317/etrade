/**
 * Created by LEE-DESKTOP on 2016-09-03.
 */
var memberlistlib = require('../lib/memberlist');

exports.getMemberList = function(callback) {
    memberlistlib.getMemberList(callback);
};

exports.addMember = function(member, callback) {
    memberlistlib.addMember(member, callback);
};

exports.deleteMember = function(mbr_nm, callback) {
    memberlistlib.deleteMember(mbr_nm, callback);
};