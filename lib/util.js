/**
 * Created by minolee on 2016-08-18.
 */
function sumCheckCode(value) {
    if(value > 9) {
        return value % 10 + parseInt(value / 10);
    } else {
        return value;
    }
}

function makeLastKey(isu_srt_cd) {
    var v1 = parseInt(isu_srt_cd[0]);
    var v2 = sumCheckCode(parseInt(isu_srt_cd[1]) * 2);
    var v3 = parseInt(isu_srt_cd[2]);
    var v4 = sumCheckCode(parseInt(isu_srt_cd[3]) * 2);
    var v5 = parseInt(isu_srt_cd[4]);
    var v6 = sumCheckCode(parseInt(isu_srt_cd[5]) * 2);
    var result = 20 + v1 + v2 + v3 + v4 + v5 + v6;
    result = result > 9 ? result % 10 : result;
    return result === 0 ? 0 : 10 - result;
}

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