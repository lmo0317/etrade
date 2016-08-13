var stocklistlib = require('../lib/stocklist');

exports.getStocklist = function(callback) {
    stocklistlib.getStocklist(callback);
};

exports.getStock = function(code, callback) {
    stocklistlib.getStock(code, callback);
};

exports.addStock = function(stock, callback) {
    stocklistlib.addStock(stock, callback);
};

exports.deleteStock = function(isu_srt_cd, callback) {
    stocklistlib.deleteStock(isu_srt_cd, callback);
};