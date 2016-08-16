
var managerService = require('../service/manager');

exports.delegate = function(app) {
    console.info('manager delegate');
    app.put('/manager/find/trading', findTrading);
};

/**
 * 해당 시간기준으로 트레이딩을 검색한다.
 * @param req
 * @param res
 */

function findTrading(req, res) {
    managerService.findTrading(function(err, result) {
        if(err)  {
            console.log(err);
            return res.send({result: false});
        }
        res.send({result: true});
    });
}