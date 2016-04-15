var qiniu = require('qiniu');
var http = require("http");
var fs = require("fs");

var config = require('../../config/himawari/config');

var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    //基本信息
    var currentDate = new Date();
    var fetchDate = new Date(currentDate.setMinutes(currentDate.getMinutes() - 30));

    var year = fetchDate.getFullYear();
    var month = fetchDate.getMonth() + 1;
    var date = fetchDate.getDate();
    var hour = fetchDate.getUTCHours();
    var minute = fetchDate.getMinutes();

    var hourStr = (hour > 10) ? hour : '0' + hour;
    var minStr = Math.floor(minute / 10) + '0';

    // console.log(hourStr, minStr);

    var url = 'http://himawari8-dl.nict.go.jp/himawari8/img/D531106/thumbnail/550/'
        + year + '/'
        + (month < 10 ? '0' + month : month) + '/'
        + date + '/' +
        hourStr + minStr +
        '00_0_0.png';

    var downloadUrl = '';

    //需要填写你的 Access Key 和 Secret Key
    qiniu.conf.SECRET_KEY = config.SECRET_KEY;
    qiniu.conf.ACCESS_KEY = config.ACCESS_KEY;

    //先判断有没有这个时刻的图片
    //构建bucketmanager对象
    var client = new qiniu.rs.Client();

    //你要测试的空间， 并且这个key在你空间中存在
    bucket = 'himawari';
    key = year + '_' + (month < 10 ? '0' + month : month) + '_' + date + '_' + hourStr + minStr + '00_0_0.png';

    //获取文件信息
    client.stat(bucket, key, function (err, ret) {
        if (!err) {
            //有文件就调
            console.log('Cache Found：', ret.hash, ret.fsize, ret.putTime, ret.mimeType);

            //构建私有空间的链接
            var requestUrl = 'http://7xt0g4.com1.z0.glb.clouddn.com/' + key;
            var policy = new qiniu.rs.GetPolicy();

            //生成下载链接url
            downloadUrl = policy.makeRequest(requestUrl);

            res.render('himawari/index', {url: downloadUrl});
        } else {
            console.log('Cache No Found', err);
            //没缓存就上传

            //1.先保存到本地
            http.get(url, function (_res) {
                var imgData = "";

                _res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
                _res.on("data", function (chunk) {
                    imgData += chunk;
                });

                _res.on("end", function () {
                    fs.writeFile("../public/images/himawari/persistent/earth.png", imgData, "binary", function (err) {
                        if (err) {
                            console.log("Image Download Failed", err);
                        } else {
                            console.log("Image Download Success");

                            //2.生成上传 Token
                            token = uptoken(bucket, key);

                            //3.要上传文件的本地路径
                            filePath = "../public/images/himawari/persistent/earth.png";

                            //4.调用uploadFile上传
                            uploadFile(token, key, filePath);

                            res.render('himawari/index', {url: 'images/himawari/persistent/earth.png'});
                        }
                    });
                });
            });


        }
    });

});

//构建上传策略函数
function uptoken(bucket, key) {
    var putPolicy = new qiniu.rs.PutPolicy(bucket + ":" + key);
    return putPolicy.token();
}

//构造上传函数
function uploadFile(uptoken, key, localFile) {
    var extra = new qiniu.io.PutExtra();
    qiniu.io.putFile(uptoken, key, localFile, extra, function (err, ret) {
        if (!err) {
            // 上传成功， 处理返回值
            console.log(ret.hash, ret.key, ret.persistentId);
        } else {
            // 上传失败， 处理返回代码
            console.log(err);
        }
    });
}

module.exports = router;