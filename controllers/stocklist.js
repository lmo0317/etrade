
var stocklistlib = require('../lib/stocklist');

exports.delegate = function(app) {
    console.info('stocklist delegate');
    app.get('/stocklist', getStockList);
    app.post('/stock', addStock);
    app.delete('/stock', deleteStock);
    app.get('/stocklist/favorite', getFavoriteStockList);
    app.post('/stock/favorite', addFavoriteStock);
    app.delete('/stock/favorite', deleteFavoriteStock);
    app.get('/stocklist/exception', getExceptionStockList);
    app.post('/stock/exception', addExceptionStock);
    app.delete('/stock/exception', deleteExceptionStock);
};

/**
 * STOCK
 */
function getStockList(req, res) {
    stocklistlib.getStockList(function(err, result) {
        res.send(result);
    });
}

function addStock(req, res) {
    var isu_nm = req.body.isu_nm;
    stocklistlib.addStock(isu_nm, function(err, result) {
        if(err) {
            console.log(err);
            return res.send({result: false});
        }
        res.send({result: true});
    });
}

function deleteStock(req, res) {
    var isu_srt_cd = req.body.isu_srt_cd;

    stocklistlib.deleteStock(isu_srt_cd, function(err, result) {
        if(err) return res.send({result: false});
        res.send({result: true});
    });
}

/**
 * FAVORITE STOCK
 */
function getFavoriteStockList(req, res) {
    stocklistlib.getFavoriteStockList(function(err, result) {
        res.send(result);
    });
}

function addFavoriteStock(req, res) {
    var isu_nm = req.body.isu_nm;
    stocklistlib.addFavoriteStock(isu_nm, function(err, result) {
        if(err) {
            console.log(err);
            return res.send({result: false});
        }
        res.send({result: true});
    });
}

function deleteFavoriteStock(req, res) {
    var isu_nm = req.body.isu_nm;
    stocklistlib.deleteFavoriteStock(isu_nm, function(err, result) {
        if(err) return res.send({result: false});
        res.send({result: true});
    });
}

/**
 * EXCEPTION STOCK
 */
function getExceptionStockList(req, res) {
    stocklistlib.getExceptionStockList(function(err, result) {
        res.send(result);
    });
}

function addExceptionStock(req, res) {
    var isu_nm = req.body.isu_nm;
    stocklistlib.addExceptionStock(isu_nm, function(err, result) {
        if(err) {
            console.log(err);
            return res.send({result: false});
        }
        res.send({result: true});
    });
}

function deleteExceptionStock(req, res) {
    var isu_nm = req.body.isu_nm;
    stocklistlib.deleteExceptionStock(isu_nm, function(err, result) {
        if(err) return res.send({result: false});
        res.send({result: true});
    });
}
