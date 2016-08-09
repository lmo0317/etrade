var fs = require('fs');
var request = require('request');
var sync = require('synchronize');
var express = require('express');
var app = express();
var mongoose = require('mongoose'); // mongoose 모듈
var controller = require('./controllers/index');
app.use(express.static('public'));
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended : true }));
app.use(cookieParser());
var global = require('./globals');

//var db = mongoose.connect('mongodb://lmo0317.iptime.org/torrent_tv'); // 접속할 DB 선택

var server = app.listen(3000, function () {
    console.info('server is started');

    sync.fiber(function() {
        sync.await(require('./globals').delegate(app, sync.defer()) );
        controller.delegate(app);
    }, function(err, res) {

    });
});