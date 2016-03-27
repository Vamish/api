var request = require('request');
var cherrio = require('cheerio');

var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {

    res.redirect(100);

});

router.get('/:range', function (req, res) {

    if (Number(req.params.range)) {

        res.redirect(req.params.range + '/type/' + 'anywords');

    } else {

        res.send({status: 'fail', message: 'PARAMS_ERROR'});

    }


});

router.get('/:range/type', function (req, res) {

    res.redirect('../' + req.params.range + '/type/' + 'anywords');

});

router.get('/type/:type', function (req, res) {

    res.redirect('../' + 100 + '/type/' + req.params.type);

});

router.get('/:range/type/:type', function (req, res, next) {
    var range = req.params.range;
    var type = req.params.type;

    console.log('查询热门\t', range, '查询类型\t', type);

    var _res = res;

    var exclusiveKeyword = /anywords$|title$|titleany$|author$|authorany$|keyword$|publisher$|clc$/;

    if (!type.match(exclusiveKeyword)) {
        _res.send({status: 'fail', message: 'KEYWORDS_ERROR'});
    } else {

        var url = 'http://smjslib.jmu.edu.cn/top100.aspx?sparaname=' + type;

        var options = {
            url: url,
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36 Query String Parameters view source view URL encoded",
                "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
            }
        };

        request(options, function (error, res, body) {
            if (!error && res.statusCode == 200) {
                var $ = cherrio.load(body);

                var topSearch = [];
                $('#top100Inner td').each(function (i, elem) {
                    if (elem.name === 'td') {
                        var raw = elem.children[1].children[0].data.trim();
                        var top = {};
                        top.name = raw.split('(')[0];
                        top.frequency = raw.split('(')[1].split(')')[0];
                        topSearch.push(top);
                    }
                });

                if (range) {
                    _res.send(topSearch.slice(0, range));
                } else {
                    _res.send(topSearch);
                }
            }
        });
    }
});

module.exports = router;