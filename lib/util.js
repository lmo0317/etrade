/**
 * Created by minolee on 2016-08-18.
 */

Number.prototype.padLeft = function(n, str) {
    return Array(n-String(this).length+1).join(str||'0')+this;
};

Array.prototype.isIn = function(key, value) {
    for(var i =0; i<this.length; i++) {
        if(this[i][key] == value) {
            return true;
        }
    }
    return false;
};

Array.prototype.contains = function(item) {
    if (typeof(item) === 'function') {
        return this.some(item);
    }
    return this.indexOf(item) >= 0;
};

exports.numberWithCommas = function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};