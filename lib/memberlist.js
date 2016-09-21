/**
 * Created by LEE-DESKTOP on 2016-09-03.
 */
var superagent = require('superagent');
var request  = superagent.agent();
var sync = require('synchronize');
var fs = require('fs');

var member = require('../schema/member');
var mongoose = require('mongoose');
var Member = mongoose.model('Member', member.MemberSchema);

exports.getMemberList = function(callback) {
    Member.find({}, callback);
};

exports.getMember = function(mbr_nm, callback) {
    Member.find({'mbr_nm': mbr_nm}, callback);
};

exports.addMember = function(member, callback) {
    sync.fiber(function() {
        //중복 체크
        var result = sync.await(exports.getMember(member.mbr_nm, sync.defer()));
        if(result.length !== 0) {
            throw 'this member already exist';
        }
        
        //member 저장
        var doc = new Member(member);
        sync.await(doc.save(sync.defer()));
    }, callback);
};

exports.deleteMember = function(mbr_nm, callback) {
    Member.remove({"mbr_nm": mbr_nm}, callback);
};