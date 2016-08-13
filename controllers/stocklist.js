
var stocklistService = require('../service/stocklist');

exports.delegate = function(app) {
    console.info('stocklist delegate');
    app.get('/stocklist', getStocklist);
    app.post('/stock', addStock);
    app.delete('/stock', deleteStock);
};

function getStocklist(req, res) {
    stocklistService.getStocklist(function(err, result) {
        console.log(result);
        res.send(result);
    });
}

function addStock(req, res) {
    var stock = {
        isu_nm: req.body.isu_nm,
        isu_srt_cd: req.body.isu_srt_cd
    };

    stocklistService.addStock(stock, function(err, result) {
        if(err) return res.send({result: false});
        res.send({result: true});
    });
}

function deleteStock(req, res) {
    var isu_srt_cd = req.body.isu_srt_cd;

    stocklistService.deleteStock(isu_srt_cd, function(err, result) {
        if(err) return res.send({result: false});
        res.send({result: true});
    });
}

