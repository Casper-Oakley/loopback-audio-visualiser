//Routes for handling loading the web app page
var express = require('express'),
    router = express.Router();

router.get('/', function(req, res) {
  res.render('index.ejs');
});

router.get('/settings', function(req, res) {
  res.render('settings.ejs');
});

module.exports = router;
