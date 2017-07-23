/**
 * Created by minolee on 2017-07-19.
 */

var moment = require('moment');

exports.getCurrentTime = function()
{
    return global.program.develop ? moment(new Date(2017, 6, 21, 14, 52, 10)) : moment();
};
