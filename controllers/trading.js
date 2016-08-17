var tradingService = require('../service/trading');

exports.delegate = function(app) {
    console.info('trading delegate');
    app.get('/trading', getTrading);
    app.put('/find/trading', findTrading);
};

function getTrading(req, res) {
    var param = {
        start: req.query.start
    };

    tradingService.getTrading(param, function(err, result) {
        console.log(result);
        res.send(result);
    });
}

function findTrading(req, res) {
    tradingService.findTrading(function(err, result) {
        if(err)  {
            console.log(err);
            return res.send({result: false});
        }
        res.send({result: true});
    });
}