var request = require('request');
var cherrio = require('cheerio');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {

    var cookies = req.query.cookie;

    console.log('用户信息\t', cookies);

    if (cookies == '') {
        res.send({status: 'fail', message: 'NO_COOKIE_ERROR'});
    } else {

        var _res = res;

        var url = "http://smjslib.jmu.edu.cn/user/userinfo.aspx";

        var jar = request.jar();
        var cookie = request.cookie('iPlanetDirectoryPro=' + cookies);
        jar.setCookie(cookie, url);

        var options = {
            url: url,
            jar: jar,
            headers: {
                "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
                "Content-Type": "x-www-form-urlencoded",
                "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
            }
        };

        request(options, function (err, res, body) {

            if (!err) {
                var $ = cherrio.load(body);

                var userinfo = {};
                userinfo.status = 'success';

                var infoes = {};

                $('#userInfoContent .infoline').each(function (i, elem) {
                    try {
                        var info = elem.children[3].children[0].data.split(' ').join('').split('\n').join('').split('\r').join('');
                        switch (i) {
                            case 0:
                                infoes.userAccountId = info;
                                break;
                            case 1:
                                infoes.userName = info;
                                break;
                            case 2:
                                infoes.userType = info;
                                break;
                            case 3:
                                infoes.userDepartment = info;
                                break;
                            case 4:
                                infoes.currentStatus = info;
                                break;
                            case 5:
                                infoes.userTele = info;
                                break;
                            case 6:
                                infoes.userMobile = info;
                                break;
                            case 7:
                                infoes.userRemarks = info;
                                break;
                            case 8:
                                infoes.userEmail = info;
                                break;
                            case 9:
                                infoes.userAddress = info;
                                break;
                            case 10:
                                infoes.userStored = info;
                                break;
                        }
                    } catch (err) {

                    }
                });
                userinfo.infoes = infoes;

                _res.send(userinfo);
            } else {
                _res.send({status: 'fail', message: 'CONNECTION_ERROR'});
            }
        })
    }
});


module.exports = router;