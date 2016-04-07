var request = require('request');
var cheerio = require('cheerio');

var express = require('express');
var router = express.Router();


/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('amoy/bus/doc', {version: 'V 1.0.0'});
});

module.exports = router;
