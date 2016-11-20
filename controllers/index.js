//주석 테스트
var fs = require('fs');


exports.delegate = function(app)
{
    var controllers = [
        'trading', 'stocklist', 'memberlist'
    ];

    controllers.forEach(function(c) {
        require('./' + c).delegate(app);
    });

    app.get('/', getIndex);
    console.info('index complete');
};

function getIndex(req, res) {
    res.sendfile('public/tradinglist.html');
}