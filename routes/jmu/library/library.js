var request = require('request');
var cherrio = require('cheerio');
var encoder = require("encode-gb2312");

var express = require('express');
var router = express.Router();

var options = {
    url: "",
    headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.109 Safari/537.36 Query String Parameters view source view URL encoded",
        "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6"
    }
};

router.get('/:keyword', function (req, res) {

    res.redirect(req.params.keyword + '/page/' + 1);

});

router.get('/:keyword/page/:page', function (req, res) {
    var page = req.params.page;
    var keyword = completeGB2312(req.params.keyword);

    var url = "http://smjslib.jmu.edu.cn/searchresult.aspx?anywords=" +
        keyword +
        "&dt=ALL" +
        "&cl=ALL" +
        "&dp=50" +
        "&sf=M_PUB_YEAR" +
        "&ob=DESC" +
        "&sm=table" +
        "&dept=ALL" +
        "&page=" + page;


    var _res = res;
    options.url = url;
    var library = {};

    console.log('SEARCH BOOK:NAME\t', req.params.keyword, 'SEARCH PAGE\t', page);

    request(options, function (error, res, body) {
        if (!error && res.statusCode == 200) {
            //console.log(body);
            var $ = cherrio.load(body);
            var hasBook = $('#ctl00_ContentPlaceHolder1_countlbl').text();

            if (hasBook != '') {

                library.status = 'success';
                library.booksTotal = Number(hasBook);

                var booksList = [];

                //获取 总页数
                var elem_select = $('#ctl00_ContentPlaceHolder1_gotoddlfl1')['0'];
                var length_children = elem_select.children.length;
                library.pagesTotal = elem_select.children[length_children - 2].attribs.value;
                library.pageCurrent = (page ? page : 1);

                if (Number(library.pageCurrent) > Number(library.pageTotal)) {
                    library.message = "OUT_OF_RANGE_AND_RETURN_LAST_PAGE"
                }

                $('tbody tr').each(function (i, elem) {
                    var book = {};

                    //获取 书本顺序
                    book.No = i + 1;

                    //获取 书本ID
                    book.bookid = elem.children[1].children[0].attribs.value;

                    //获取 书本名
                    book.name = elem.children[3].children[0].children[0].children[0].data;

                    //获取 作者/责任人
                    var author = elem.children[5].children[0];
                    if (author != undefined) {
                        book.author = author.data;
                    } else {
                        book.author = ""
                    }

                    //获取 出版社
                    book.publisher = elem.children[7].children[0].data;

                    //获取 索书号
                    book.callNumber = elem.children[11].children[0].data;

                    //获取 馆藏数
                    book.total = elem.children[13].children[0].data;

                    //获取 可借数
                    book.available = elem.children[15].children[0].data;

                    booksList.push(book);
                });

                library['booksList'] = booksList;
            } else {
                library.status = 'fail';
                library.message = 'NO_BOOK_FOUND';
            }
        }

        _res.status(200)
            .jsonp(library);
    });

});

//Handle encoder method
function completeGB2312(str) {

    var uncomplete = encoder.encodeToGb2312(str);
    var complete = "";
    for (var i = 0, len = (uncomplete.length / 2); i < len; i++) {
        complete += "%";
        complete += uncomplete.substr(i * 2, 2);
    }
    return complete;
}

module.exports = router;