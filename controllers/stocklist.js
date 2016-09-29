
var stocklistService = require('../service/stocklist');

exports.delegate = function(app) {
    console.info('stocklist delegate');
    app.get('/stocklist', getStocklist);
    app.post('/stock', addStock);
    app.delete('/stock', deleteStock);
};

function getStocklist(req, res) {
    stocklistService.getStocklist(function(err, result) {
        res.send(result);
    });
}

function addStock(req, res) {
    var isu_nm = req.body.isu_nm;
    stocklistService.addStock(isu_nm, function(err, result) {
        if(err) {
            console.log(err);
            return res.send({result: false});
        }
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

