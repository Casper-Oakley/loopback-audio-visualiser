var express  = require('express'),
    fs       = require('fs'),
    defaults = require('../../defaults'),
    cv       = require('opencv'),
    request  = require('request'),
    router   = express.Router();

//led module is passed in through requires
module.exports = function(led) {

  router.post('/default', function(req, res) {
    led.setHue(defaults.hue);
    led.setSat(defaults.sat);
    res.status(200).send();
  });

  router.post('/colour', function(req, res) {
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

  router.post('/album', function(req, res) {

    var cvStream = new cv.ImageDataStream();

    if(req.body.url) {
      request.get(req.body.url).pipe(cvStream);
    } else {
      res.status(400).send();
    }

    cvStream.on('load', function(matrix) {
      matrixArr = matrix.split();
      if(matrixArr.length == 4) {
        matrixArr.pop();
      }
      matrix.merge(matrixArr);
      matrix.convertHSVscale();
      hsvMats = matrix.split();

      var num_bins = 256,
          num_cols = 4;

      var hueHistogram = new Array(num_bins).fill(0),
          satHistogram = new Array(num_bins).fill(0);
      //Produce a hue histogram manually (thnx node opencv bindings for being absolutely useless)
      for(var x=0; x < hsvMats[0].width(); x++) {
        for(var y=0; y < hsvMats[0].height(); y++) {
          var index = Math.floor(num_bins*hsvMats[0].pixel(y,x)/256);
          hueHistogram[index]++;
        }
      }

      //And the same for sat histogram
      for(var x=0; x < hsvMats[1].width(); x++) {
        for(var y=0; y < hsvMats[1].height(); y++) {
          var index = Math.floor(num_bins*hsvMats[1].pixel(y,x)/256);
          satHistogram[index]++;
        }
      }

      var topHues = getTopEntries(hueHistogram, num_cols),
          topSats = getTopEntries(satHistogram, num_cols);

      topHues = topHues.map(function(e) {
        return e/num_bins;
      });
      //Saturations should be a minimum amount (TODO should they tho??)
      topSats = topSats.map(function(e) {
        return 0.5 + 0.5*e/num_bins;
      });

      //Finally send new hue and sat functions to LEDs
      //Plot a set of linear lines to calculate expected hue
      //length = 60, num_cols = 4, i = 40
      // xdiff = 15 (each bracket is 15
      // binLoc = floor(40/15) = 2
      // l = yval for second tip (0.5)
      // r = yval for third tip (0.8)
      // ydiff = diffrence in y vals = 0.8 - 0.5 = 0.3
      // m = 0.3/15 = 0.02
      // c = 0.5 - m*(xval for left point) = 0.5 - 0.02(15*2) = -0.1
      // so we should return: 0.02*40 - 0.1 = 0.7
      led.setHue(function(i, length, t) {
        i = (i + Math.floor(t/6))%length;
        var xdiff = length/num_cols;
        var binLoc = Math.floor(i/xdiff);
        var l = topHues[binLoc],
            r = topHues[(binLoc+1)%num_cols];
        //Generate a line between two nearest points
        var ydiff = r - l;
        var m = ydiff/xdiff;
        var c = l - m*xdiff*binLoc;
        return m*i + c;
      });

      res.status(200).send();
    });
  });


  return router;
};


//Function to get the indexes of the top n elements in an arr
var getTopEntries = function(arr, n) {
  var original = arr.slice();
  return arr.sort(function(a, b){
    return b - a;
  }).slice(0,n).map(function(e) {
    return original.findIndex(function(he) {
      return he == e;
    });
  });
};
