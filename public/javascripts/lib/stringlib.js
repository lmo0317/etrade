/**
 * Created by LEE-DESKTOP on 2016-11-22.
 */

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}