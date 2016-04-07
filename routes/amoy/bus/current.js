var request = require('request');
var cheerio = require('cheerio');

var express = require('express');
var router = express.Router();

router.get('/:lineID/:direction', function (req, res, next) {
    var lineID = req.params.lineID;
    var direction = req.params.direction;

    var url = 'http://mybus.xiamentd.com/LineDetailQuery?' +
        'lineId=' + lineID +
        '&direction=' + direction;

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
            try {
                var $ = cheerio.load(body);

                var bus = {};

                bus.status = true;

                $('.model-content-a').each(function (i, elem) {
                    switch (i) {
                        case 0:
                            var lineDescription = elem.children[0].data.trim().split('(');
                            bus.lineDescription = {};
                            bus.lineDescription.lineNo = lineDescription[0];
                            bus.lineDescription.departureStation = lineDescription[1].split('→')[0];
                            bus.lineDescription.terminalStation = lineDescription[1].split('→')[1].split(')')[0];
                            break;
                        case 1:
                            var schedule = elem.children[0].data.trim().split(' ');
                            bus.schedule = {};
                            //获取 首班车发车时间
                            bus.schedule.dailyStartTime = schedule[0].split(':')[1] + ':' + schedule[0].split(':')[2].split('--')[0];
                            //获取 末班车发车时间
                            bus.schedule.dailyEndTime = schedule[0].split('--')[1];
                            //获取 下一班计划发车时间
                            bus.schedule.nextDepartTime = schedule[1].split(':')[1] + ':' + schedule[1].split(':')[2];
                            break;
                        case 2:
                            //获取 总站数
                            bus.totalStations = +elem.children[0].data.trim().split('共')[1].split('站')[0];
                            break;
                    }
                });

                bus.stations = [];
                $('.list-bus-station').each(function (i, elem) {
                    var station = {};

                    //获取 当前站序号
                    station.no = +elem.children[1].children[0].data;

                    //获取 当前站名
                    station.name = $(elem).find('.list-bus-station-content')[0].children[1].children[0].data;

                    //获取 车辆状况
                    try {
                        var status = $(elem).find('.list-bus-station-showBus')[0].children[1].children[1].children[0];
                        if (status.data) {
                            station.status = status.data.trim();
                        }
                    } catch (err) {
                        station.status = ' ';
                    }

                    bus.stations.push(station);
                });
                res.send(bus);
            } catch (err) {
                res.send({status: false, msg: 'PARAMS_ERROR'})
            }
        } else {
            res.send({status: false, msg: 'PARAMS_ERROR'})
        }
    })
});

module.exports = router;