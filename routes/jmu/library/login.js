var request = require('request');
var express = require('express');
var router = express.Router();

router.post('/', function (req, res, next) {

    var _res = res;

    var user = req.body;
    console.log('用户登录\t', user);

    var loginUrl = "http://libinfo.jmu.edu.cn/cuser/";
    var loginOptions = {
        url: loginUrl,
        timeout: 30 * 1000,
        headers: {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/46.0.2490.86 Safari/537.36",
            "Content-Type": "x-www-form-urlencoded",
            "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
        },
        form: {
            '__VIEWSTATE': '/wEPDwULLTE3OTEyNjY3NjFkZNqnTdHPer8i7/KpwiHD/CnHVgZEda8MaVn9XTSCaswc',
            '__EVENTVALIDATION': '/wEWBALZ4dupBALcgpeMBwLGmdGVDAKM54rGBskycVhQHFcvHARxC0oV7bW0FLvBuUgfzUDjp9DvaiCw',
            'user': user.user,
            'pwd': user.pwd,
            'Button1': '登录'
        }
    };
    request.post(loginOptions, function (error, res, body) {
        var result = {};

        if (!error && res.statusCode == 200) {
            try {
                var loginCookie = res.headers['set-cookie'].toString().split(';')[0].split('=')[1];

                result.status = 'success';
                result.cookie = loginCookie;
                _res.send(result);
            } catch (err) {
                switch (err.name) {
                    case 'TypeError':
                        //用户名 / 密码错误
                        result.status = 'fail';
                        result.message = 'NAME_OR_PWD_ERROR';
                        _res.send(result);
                        break;
                }
            }
        } else {
            result.status = 'fail';
            result.message = 'TIME_OUT_ERROR';
            _res.send(result);
        }
    });


});


module.exports = router;