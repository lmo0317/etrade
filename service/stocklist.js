var stocklistlib = require('../lib/stocklist');

exports.getStockList = function(callback) {
    stocklistlib.getStockList(callback);
};

exports.getStock = function(isu_nm, callback) {
    stocklistlib.getStock(isu_nm, callback);
};

exports.addStock = function(isu_nm, callback) {
    stocklistlib.addStock(isu_nm, callback);
};

exports.deleteStock = function(isu_srt_cd, callback) {
    stocklistlib.deleteStock(isu_srt_cd, callback);
};

exports.getFavoriteStockList = function(callback) {
    stocklistlib.getFavoriteStockList(callback);
};

exports.addFavoriteStock = function(isu_nm, callback) {
    stocklistlib.addFavoriteStock(isu_nm, callback);
};

exports.deleteFavoriteStock = function(isu_nm, callback) {
    stocklistlib.deleteFavoriteStock(isu_nm, callback);
};
