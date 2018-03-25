var express = require('express');
var router = express.Router();
var client = require('../app');

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a users');
});



module.exports = router;
