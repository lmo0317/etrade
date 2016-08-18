/**
 * Created by minolee on 2016-08-18.
 */

Number.prototype.padLeft = function(n, str) {
    return Array(n-String(this).length+1).join(str||'0')+this;
};