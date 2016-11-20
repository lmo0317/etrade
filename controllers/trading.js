var tradingService = require('../service/trading');

exports.delegate = function(app) {
    console.info('trading delegate');
    app.get('/trading', getTrading);
};

function getTrading(req, res) {
    var param = {
        start: req.query.start,
        type: req.query.type
    };

    tradingService.getTradingList(param, function(err, result) {
        //거래량 기준 정렬
        if(err) {
            console.log(err);
            return res.send(500, err);
        }

        result.sort(function(a, b) {
            return b.buylist[b .buylist.length-1].netaskval - a.buylist[a.buylist.length-1].netaskval;
        });
        
        res.send(result);
    });
}