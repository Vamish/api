var request = require('request');
var cherrio = require('cheerio');
var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {

    var cookies = req.query.cookie;

    console.log('查询当前借阅\t', cookies);

    if (cookies == '') {
        res.send({status: 'fail', message: 'NO_COOKIE_ERROR'});
    } else {

        var _res = res;

        var url = "http://smjslib.jmu.edu.cn/user/bookborrowed.aspx";

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
                var tr = $('#borrowedcontent tbody tr');

                var borrowedData = {}
                borrowedData.status = 'success';

                var booksList = [];
                var total = 0;
                $(tr).each(function (i, elem) {
                    total++;
                    var book = {};

                    //获取 书本顺序
                    book.No = i + 1;

                    //获取 书本ID
                    book.bookid = elem.children[5].children[0].attribs.href.split('=')[1];

                    var name_author = elem.children[5].children[0].children[0].data;

                    //获取 书本名
                    book.name = name_author.split('／')[0];

                    //获取 作者
                    book.author = name_author.split('／')[1];

                    //获取 最迟应还期
                    var expire = elem.children[3].children[0].data;
                    book.expireDate = {};
                    book.expireDate.rawValue = expire;
                    book.expireDate.year = expire.split('-')[0];
                    book.expireDate.month = expire.split('-')[1];
                    book.expireDate.date = expire.split('-')[2];

                    //获取 书本续借情况
                    book.renewable = (elem.children[1].children[1]) ? true : false;

                    //获取 书本图书类型
                    book.type = elem.children[9].children[0].data;

                    //获取 书本登录号
                    book.accessNo = elem.children[11].children[0].data;

                    //获取 书本借期
                    var borrowedTime = elem.children[13].children[0].data;
                    book.borrowedDate = {};
                    book.borrowedDate.rawValue = borrowedTime;
                    book.borrowedDate.year = borrowedTime.split('-')[0];
                    book.borrowedDate.month = borrowedTime.split('-')[1];
                    book.borrowedDate.date = borrowedTime.split('-')[2];

                    booksList.push(book);
                });

                borrowedData.booksTotal = total;
                if (total) {
                    borrowedData.booksList = booksList;
                }

                _res.jsonp(borrowedData);
            } else {
                _res.jsonp({status: 'fail', message: 'CONNECTION_ERROR'});
            }
        })
    }
});


module.exports = router;