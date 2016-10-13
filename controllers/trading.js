var tradingService = require('../service/trading');

exports.delegate = function(app) {
    console.info('trading delegate');
    app.get('/trading', getTrading);
    app.put('/find/trading', findTrading);
};

function getTrading(req, res) {
    var param = {
        start: req.query.start,
        type: req.query.type
    };

    tradingService.getTradingList(param, function(err, result) {
        //거래량 기준 정렬
        if(err) return res.send(500, err);

        result.sort(function(a, b) {
            return b.buylist[b .buylist.length-1].netaskval - a.buylist[a.buylist.length-1].netaskval;
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