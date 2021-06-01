var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: '光谷智慧交通管理平台' });
});

module.exports = router;
