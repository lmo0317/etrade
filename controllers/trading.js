var tradingService = require('../service/trading');
var timelib = require('../lib/time');

exports.delegate = function(app) {
    console.info('trading delegate');
    app.get('/tradinglist', getTradingList);
    app.get('/trading', getTrading);
    app.put('/trading', editTrading);
    app.post('/trading/find', findTrading);
};

function editTrading(req, res) {
    var param = {
        start: req.body.start,
        isu_nm: req.body.isu_nm
    };

    tradingService.editTrading(param, function(err, result) {
        if(err) {
            console.log(err);
            return res.send(500, err);
        }
        res.send(result);
    });
}

function findTrading(req, res) {
    var param = {
        start: timelib.getCurrentTime().format("YYMMDD"),
        isu_nm: req.body.isu_nm
    };

    tradingService.findTrading(param, function(err, result) {
        if(err) {
            console.log(err);
            return res.send(500, err);
        }
        res.send(result);
    });
}

function getTrading(req, res) {
    var param = {
        start: req.query.start,
        isu_nm: req.query.isu_nm
    };

    tradingService.getTrading(param, function(err, result) {
        if(err) {
            console.log(err);
            return res.send(500, err);
        }
        res.send(result);
    });
}

function getTradingList(req, res) {
    var param = {
        start: req.query.start,
        type: req.query.type,
        count: req.query.count
    };

    tradingService.getTradingList(param, function(err, result) {
        //거래량 기준 정렬
        if(err) {
            console.log(err);
            return res.send(500, err);
        }
        result = tradingService.filterRemove(result);
        result.sort(function(a, b) {
            return b.buylist[b .buylist.length-1].netaskval - a.buylist[a.buylist.length-1].netaskval;
        });
        
        res.send(result);
    });
}