var express  = require('express'),
    defaults = require('../../defaults'),
    router   = express.Router();

//led module is passed in through requires
module.exports = function(led) {

  router.post('/default', function(req, res) {
    led.setHue(defaults.hue);
    led.setSat(defaults.sat);
    res.status(200).send();
  });

  router.post('/colour', function(req, res) {
    console.log(req.body);
    req.body.hue = req.body.hue || 0;
    req.body.sat = req.body.sat || 1;
    led.setHue(function(i, length, t) {
      return req.body.hue;
    });
    led.setSat(function(i, length, t) {
      return req.body.sat;
    });
    res.status(200).send();
  });


  return router;
};
