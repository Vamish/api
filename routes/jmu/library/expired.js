var request = require('request');
var cherrio = require('cheerio');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {

    var cookies = req.query.cookie;

    console.log('CHECK EXPIRED\t', cookies);

    if (cookies == '') {
        res.jsonp({status: 'fail', message: 'NO_COOKIE_ERROR'});
    } else {

        var _res = res;

        var url = "http://smjslib.jmu.edu.cn/user/chtsmessage.aspx";

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

                var expireBooks = {};
                expireBooks.status = 'success';

                $('.tb').each(function (i, elem) {
                    switch (i) {
                        case 0:
                            // 超期未还图书
                            var expiredBooksList = [];
                            var expiredTotal = 0;
                            $(elem).find('tbody tr').each(function (i, elem) {
                                expiredTotal++;
                                var expiredBook = {};
                                //获取 未还书顺序
                                expiredBook.No = i + 1;

                                //获取 书名 & 作者 & 书本id
                                var id_name_author = elem.children[9].children[0];
                                expiredBook.bookid = id_name_author.attribs.href.split('=')[1];
                                expiredBook.name = id_name_author.children[0].data.split('／')[0];
                                expiredBook.author = id_name_author.children[0].data.split('／')[1];

                                //获取 图书藏室
                                expiredBook.location = elem.children[5].children[0].data;

                                //获取 最迟应还期
                                var expiredDate = {};
                                expiredDate.rawValue = elem.children[7].children[0].data;
                                expiredDate.year = expiredDate.rawValue.split('/')[0];
                                expiredDate.month = expiredDate.rawValue.split('/')[1];
                                expiredDate.date = expiredDate.rawValue.split('/')[2];
                                expiredBook.expiredDate = expiredDate;

                                //获取 登录号
                                expiredBook.accessNo = elem.children[3].children[0].data;

                                //获取 单位名称
                                expiredBook.departmentName = elem.children[1].children[0].data;

                                expiredBooksList.push(expiredBook);
                            });
                            expireBooks.expiredTotal = expiredTotal;
                            if (expiredTotal) {
                                expireBooks.expiredBooks = expiredBooksList;
                            }
                            break;
                        case 1:
                            // 超期未还图书
                            var expiringBooksList = [];
                            var expiringTotal = 0;
                            $(elem).find('tbody tr').each(function (i, elem) {
                                expiringTotal++;
                                var expiringBook = {};
                                //获取 未还书顺序
                                expiringBook.No = i + 1;

                                //获取 书名 & 作者 & 书本id
                                var id_name_author = elem.children[9].children[0];
                                expiringBook.bookid = id_name_author.attribs.href.split('=')[1];
                                expiringBook.name = id_name_author.children[0].data.split('／')[0];
                                expiringBook.author = id_name_author.children[0].data.split('／')[1];

                                //获取 图书藏室
                                expiringBook.location = elem.children[5].children[0].data;

                                //获取 最迟应还期
                                var expiredDate = {};
                                expiredDate.rawValue = elem.children[7].children[0].data;
                                expiredDate.year = expiredDate.rawValue.split('/')[0];
                                expiredDate.month = expiredDate.rawValue.split('/')[1];
                                expiredDate.date = expiredDate.rawValue.split('/')[2];
                                expiringBook.expiredDate = expiredDate;

                                //获取 登录号
                                expiringBook.accessNo = elem.children[3].children[0].data;

                                //获取 单位名称
                                expiringBook.departmentName = elem.children[1].children[0].data;

                                expiringBooksList.push(expiringBook);
                            });
                            expireBooks.expiringTotal = expiringTotal;
                            if (expiringTotal) {
                                expireBooks.expiringBooks = expiringBooksList;
                            }
                            break;
                    }
                });

                _res.jsonp(expireBooks);
            } else {
                _res.jsonp({status: 'fail', message: 'CONNECTION_ERROR'});
            }
        })
    }
});


module.exports = router;