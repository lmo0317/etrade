/**
 * Created by LEE-DESKTOP on 2016-12-14.
 */

var managerlib = require('../lib/manager');

exports.delegate = function(app) {
    console.info('manager delegate');
    app.get('/manager/setting', getManagerSetting);
    app.post('/manager/setting', setManagerSetting);
};

function getManagerSetting(req, res) {
    managerlib.getManagerSetting(function(err, result) {
        if(err) return res.send({result: false});
        res.send(result);
    });
}

function setManagerSetting(req, res) {
    var setting = {
        cron: JSON.parse(req.body.cron)
    };

    managerlib.setManagerSetting(setting, function(err, result) {
        if(err) return res.send({result: false});
        res.send(result);
    });
}

