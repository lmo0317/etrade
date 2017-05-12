//주석 테스트
var fs = require('fs');
var logsService = require('../service/logs');

exports.delegate = function(app)
{
    var controllers = [
        'trading', 'stocklist', 'memberlist', 'manager'
    ];

    controllers.forEach(function(c) {
        require('./' + c).delegate(app);
    });

    app.get('/', getIndex);
    app.get('/manager', getManager);
    console.info('index complete');
};

function getIndex(req, res) {
    logsService.addConnection(function() {
        res.sendfile('public/main.html');
    });
}

function getManager(req, res) {
    res.sendfile('public/manager.html');
}