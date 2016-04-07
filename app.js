var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

//JMU LIBRARY
var libraryDoc = require('./routes/jmu/library/doc');
var library = require('./routes/jmu/library/library');
var book = require('./routes/jmu/library/book');
var top = require('./routes/jmu/library/top');
var login = require('./routes/jmu/library/login');
var borrowed = require('./routes/jmu/library/borrowed');
var expired = require('./routes/jmu/library/expired');
var userinfo = require('./routes/jmu/library/user/info');

//AMOY BUS
var BusDoc = require('./routes/amoy/bus/doc');
var BusLine = require('./routes/amoy/bus/line');
var BusCurrent = require('./routes/amoy/bus/current');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/jmu/library/doc', libraryDoc);
app.use('/jmu/library/search', library);
app.use('/jmu/library/book', book);
app.use('/jmu/library/top', top);
app.use('/jmu/library/login', login);
app.use('/jmu/library/borrowed', borrowed);
app.use('/jmu/library/expired', expired);
app.use('/jmu/library/user/info', userinfo);


app.use('/amoy/bus/doc', BusDoc);
app.use('/amoy/bus/line', BusLine);
app.use('/amoy/bus/current', BusCurrent);

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
