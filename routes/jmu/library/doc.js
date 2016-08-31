var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('jmu/library/doc', {version: 'V 2.2.1'});
});

module.exports = router;
