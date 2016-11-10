var express  = require('express'),
    defaults = require('../../defaults'),
    request  = require('request'),
    router   = express.Router();

var musicLoopLoc = '';

//led module is passed in through requires
module.exports = function(led) {
  
  router.post('/start', function(req, res) {

  });

  return router;
};
