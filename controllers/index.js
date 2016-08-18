//주석 테스트

exports.delegate = function(app)
{
    var controllers = [
        'trading', 'stocklist'
    ];

    console.info(controllers);

    controllers.forEach(function(c) {
        require('./' + c).delegate(app);
    });

    console.info('index complete');
};