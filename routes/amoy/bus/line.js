var request = require('request');
var cheerio = require('cheerio');

var express = require('express');
var router = express.Router();

router.get('/:line', function (req, res, next) {
    var busLine = req.params.line;
    console.log(busLine);

    var url = 'http://mybus.xiamentd.com/LineQuery?line=' + busLine;
    var options = {
        url: url,
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36 Query String Parameters view source view URL encoded",
            "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6",
            'Cookie': 'JSESSIONID=563DBE2FD1B45065EBCA95607AFB8A4C; frompath="http://mybus.xiamentd.com/LineDetailQuery?lineId=562&direction=1&random=1459999921502"; HttpOnly=true; model="TW96aWxsYS81LjAgJiAjNDA7TWFjaW50b3NoOyBJbnRlbCBNYWMgT1MgWCAxMF8xMV8xJiAjNDE7 IEFwcGxlV2ViS2l0LzUzNy4zNiAmICM0MDtLSFRNTCwgbGlrZSBHZWNrbyYgIzQxOyBDaHJvbWUv NDkuMC4yNjIzLjExMCBTYWZhcmkvNTM3LjM2'
        }
    };

    request(options, function (err, _res, body) {
        if (!err) {
            var $ = cheerio.load(body);
            var nofound = false;

            var lines = {};
            lines.status = true;
            $('.model-content-a').each(function (i, elem) {
                if (i == 0) {
                    var message = elem.children[0].data.trim();
                    if (!message.match(/无此线路！$/)) {
                        lines.total = +elem.children[0].data.trim().split('共找到')[1].split('条线路')[0];
                    } else {
                        nofound = true;
                    }
                }
            });

            lines.results = [];
            $('.list.list-route').each(function (i, elem) {
                var line = {};
                line.lineID = elem.children[1].attribs.href.split('?lineId=')[1].split('&')[0];
                line.direction = elem.children[1].attribs.href.split('&direction=')[1];

                var detail = elem.children[1].children[0].data;
                line.detail = {};
                line.detail.name = detail.split('(')[0];
                line.detail.startStation = detail.split('(')[1].split('→')[0];
                line.detail.endStation = detail.split('→')[1].split(')')[0];

                lines.results.push(line);
            });
            nofound ? res.send({status: false, msg: 'NOT_MATCH'}) : res.send(lines);
        }
    });

});

module.exports = router;