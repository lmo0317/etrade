var request = require('request');
var sync = require('synchronize');

(function main() {

    var body = {
        DepStn: 'TPE',
        ArrStn: 'ICN',
        AdultPaxCnt: 2,
        ChildPaxCnt: 0,
        InfantPaxCnt: 0,
        RouteType: 'I',
        Language: 'KR',
        SystemType: 'IBE',
        TripType: 'RT',
        SegType: 'RET',
        DepDate: '2016-09-11',
        Index: 2
    };

    sync.fiber(function() {

        var result = sync.await(request.get('https://www.jejuair.net/jejuair', sync.defer()));

        var options = {
            url : 'https://www.jejuair.net/jejuair/com/jeju/ibe/goAvail.do',
            form: body,
            header: result.header,
            headrs: result.headers
        };

        var url = 'https://www.jejuair.net/jejuair/com/jeju/ibe/goAvail.do';

        request.post(options, function(err,httpResponse,body) {
            console.log(body);
        });

    }, function(err, res) {
        if(err) console.log(err);
    });

})();