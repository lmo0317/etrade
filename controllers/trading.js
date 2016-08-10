var tradingService = require('../service/trading');

exports.delegate = function(app) {
    console.info('trading delegate');
    app.get('/trading', getTrading);
};

var getTrading  = function(req, res) {
    var param = {
        start: req.query.start
    };

    tradingService.getTrading(param, function(err, result) {
        console.log(result);
        res.send(result);
    });
};
