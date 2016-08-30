var fs = require('fs');
var request = require('request');
var sync = require('synchronize');
var express = require('express');
var app = express();
var mongoose = require('mongoose'); // mongoose 모듈
var controller = require('./controllers/index');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var util = require('./lib/util');
var config = require('./config');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded( { extended : true }));
app.use(cookieParser());

config.init();

//db
mongoose.connect(global.configure.db.path);

var server = app.listen(3000, function () {
    console.info('server is started');
    controller.delegate(app);
});