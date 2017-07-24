var fs = require('fs');
exports.load = function(DB) {
    DB.MANAGER_SETTING = JSON.parse(fs.readFileSync('./staticdata/manager_setting.json'));
    DB.MEMBER_LIST = JSON.parse(fs.readFileSync('./staticdata/memberlist.json'));
};