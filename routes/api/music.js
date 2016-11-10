var express  = require('express'),
    defaults = require('../../defaults'),
    config   = require('../../config.json'),
    spawn    = require('child_process').spawn,
    request  = require('request'),
    router   = express.Router();

var args      = [],
    loopChild = spawn(config.musiclooploc, args);

//led module is passed in through requires
module.exports = function(led) {


  router.post('/status', function(req, res) {
    res.status(200).json({
      status: loopChild.pid>=0?'Running':'Stopped',
      pid: loopChild.pid
    });
  });
  

  router.post('/start', function(req, res) {
    if(loopChild.pid < 0) {
      loopChild = spawn(config.musiclooploc, args);
      attachEventHandlers(loopChild, led);
      res.status(200).send();
    } else {
      res.status(403).json({status: 'Child already running. Try /restart if you want to force a restart.'});
    }

  });

  router.post('/stop', function(req, res) {
    if(loopChild.pid < 0) {
      res.status(403).json({status: 'Child is not currently running. Try /start if you want to start it.'});
    } else {
      loopChild.kill();
      loopChild.pid = -1;
      res.status(200).send();
    }
  });

  router.post('/restart', function(req, res) {
    if(loopChild.pid > 0) {
      loopChild.kill('SIGKILL');
      loopChild = spawn(config.musiclooploc, args);
      attachEventHandlers(loopChild, led);

      res.status(200).send();
    } else {
      loopChild = spawn(config.musiclooploc, args);
      attachEventHandlers(loopChild, led);
      res.status(200).send();
    }
  });
  
  attachEventHandlers(loopChild, led);

  return router;
};

//Function to add the two event listeners to any
//loopchild process
var attachEventHandlers = function(loopChild, led) {
  loopChild.on('error', function() {
    loopChild.kill('SIGKILL');
    loopChild.pid = -1;
    isRunning = false;
  });

  loopChild.on('exit', function(code) {
    //Give leds enough time to consume the rest of the
    //message broker queue, then flush leds with zero
    setTimeout(function() {
      led.writeToLed(new Array(2048).fill(0));
    }, 100);
  });
};
