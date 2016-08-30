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

    tradingService.getTradingList(param, function(err, result) {
        console.log(result);
        result.sort(function(a, b) {
            return b.buylist[b.buylist.length-1].sum - a.buylist[a.buylist.length-1].sum;
        });
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