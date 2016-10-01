
var stocklistService = require('../service/stocklist');

exports.delegate = function(app) {
    console.info('stocklist delegate');
    app.get('/stocklist', getStockList);
    app.post('/stock', addStock);
    app.delete('/stock', deleteStock);
    app.get('/stocklist/favorite', getFavoriteStockList);
    app.post('/stock/favorite', addFavoriteStock);
    app.delete('/stock/favorite', deleteFavoriteStock);
};

function getStockList(req, res) {
    stocklistService.getStockList(function(err, result) {
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

function getFavoriteStockList(req, res) {
    stocklistService.getFavoriteStockList(function(err, result) {
        res.send(result);
    });
}

function addFavoriteStock(req, res) {
    var isu_nm = req.body.isu_nm;
    stocklistService.addFavoriteStock(isu_nm, function(err, result) {
        if(err) {
            console.log(err);
            return res.send({result: false});
        }
        res.send({result: true});
    });
}

function deleteFavoriteStock(req, res) {
    var isu_nm = req.body.isu_nm;
    stocklistService.deleteFavoriteStock(isu_nm, function(err, result) {
        if(err) return res.send({result: false});
        res.send({result: true});
    });
}
