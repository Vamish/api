var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
//var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//INDEX
var api = {};
api.index = require('./routes/index');

//JMU LIBRARY
var library = {};
library.doc = require('./routes/jmu/library/doc');
library.library = require('./routes/jmu/library/library');
library.book = require('./routes/jmu/library/book');
library.top = require('./routes/jmu/library/top');
library.login = require('./routes/jmu/library/login');
library.borrowed = require('./routes/jmu/library/borrowed');
library.expired = require('./routes/jmu/library/expired');
library.userinfo = require('./routes/jmu/library/user/info');

//AMOY BUS
var bus = {};
bus.doc = require('./routes/amoy/bus/doc');
bus.line = require('./routes/amoy/bus/line');
bus.current = require('./routes/amoy/bus/current');

//HIMAWARI 8
var himawari = {};
himawari.index = require('./routes/himawari/index');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', api.index);

app.use('/jmu/library/doc', library.doc);
app.use('/jmu/library/search', library.library);
app.use('/jmu/library/book', library.book);
app.use('/jmu/library/top', library.top);
app.use('/jmu/library/login', library.login);
app.use('/jmu/library/borrowed', library.borrowed);
app.use('/jmu/library/expired', library.expired);
app.use('/jmu/library/user/info', library.userinfo);

app.use('/amoy/bus/doc', bus.doc);
app.use('/amoy/bus/line', bus.line);
app.use('/amoy/bus/current', bus.current);

app.use('/himawari', himawari.index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
