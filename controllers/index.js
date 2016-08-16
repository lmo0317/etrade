
exports.delegate = function(app)
{
    var controllers = [
        'trading', 'stocklist', 'manager'
    ];

    console.info(controllers);

    controllers.forEach(function(c) {
        require('./' + c).delegate(app);
    });

    console.info('index complete');
};