var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
    var introduction = {
        title: '__API for JMU Library',
        description: 'Provide search list & books function for everyone. All content is scraped from the JMU Library\'s official website. ',
        author: 'This website is currently maintained by Vango.'
    };
    res.render('index', introduction);
});

module.exports = router;
