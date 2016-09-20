/**
 * Created by LEE-DESKTOP on 2016-09-03.
 */

var mongoose =require('mongoose');

exports.MemberSchema = new mongoose.Schema({
    mbr_nm: {type:String, require:true}
});