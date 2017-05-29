/**
 * Created by LEE-DESKTOP on 2016-11-22.
 */
function parseIntRemoveComma(value)
{
    if(typeof(value) == 'number') {
        return parseInt(value, 10);
    } else if(typeof(value) == 'string') {
        return parseInt(value.replace(/,/g, ""),10);
    }
    return 0;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}