var express  = require('express'),
    fs       = require('fs'),
    defaults = require('../../defaults'),
    cv       = require('opencv'),
    async    = require('async'),
    request  = require('request'),
    router   = express.Router();

//led module is passed in through requires
module.exports = function(led) {

  //Name for the lastfm watcher (and current album)
  var lastfmName = 'iraq19',
      currentAlbumUrl = '';

  router.post('/default', function(req, res) {
    led.setHue(defaults.hue);
    led.setSat(defaults.sat);
    currentAlbumUrl = '';
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
    currentAlbumUrl = '';
    res.status(200).send();
  });

  router.post('/album', function(req, res) {

    if(!req.body.url) {
      res.status(400).send();
    } else {
      //Set defaults for optional parameters
      if(!req.body.bins) {
        req.body.bins = 16;
      }
      if(!req.body.colours) {
        req.body.colours = 4;
      }
      colourFromImage(req.body.url, req.body.bins, req.body.colours, led, function() {
        currentAlbumUrl = req.body.url;
        res.status(200).send();
      });
    }
  });


  router.post('/watcher', function(req, res) {
    lastfmName = req.body.username;
    if(!lastfmName) {
      led.setHue(defaults.hue);
      led.setSat(defaults.sat);
      currentAlbumUrl = '';
    }
    res.status(200).send();
  });


  //async whilst loop to watch for album change on lastfm
  async.whilst(function() { return true;},
    function(cb) {
      setTimeout(function() {
        if(lastfmName) {
          var recentUrl = 'http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks' + 
            '&api_key=351f3b3acf21f9eeb961fe76241f686c' + 
            '&format=json' +
            '&user=' + lastfmName +
            '&limit=1';
          request(recentUrl, function(err, res, body) {
            body = JSON.parse(body);
            if(!err && 
              body &&
              body.recenttracks && 
              body.recenttracks.track[0] && 
              body.recenttracks.track[0]['@attr'] &&
              body.recenttracks.track[0].image[3]['#text'] != currentAlbumUrl) {
              colourFromImage(body.recenttracks.track[0].image[3]['#text'], 16, 4, led, function() {
                currentAlbumUrl = body.recenttracks.track[0].image[3]['#text'];
                cb(null);
              });
            } else {
              cb(null);
            }
          });
        } else {
          cb(null);
        }
      }, 1000);
    },
    function(err) {
      console.log('Unexpected error.');
  });


  return router;
};


var colourFromImage = function(url, bins, colours, led, callback) {
  var cvStream = new cv.ImageDataStream();

  request.get(url).pipe(cvStream);

  cvStream.on('load', function(matrix) {
    matrixArr = matrix.split();
    if(matrixArr.length == 4) {
      matrixArr.pop();
    }
    matrix.merge(matrixArr);
    matrix.convertHSVscale();
    hsvMats = matrix.split();

    var hueSatHistogram = zeros([bins, bins]);
    //Produce a hue-sat histogram manually (thnx node opencv bindings for being absolutely useless)
    //Note: X is hue, Y is sat
    for(var x=0; x < hsvMats[0].width(); x++) {
      for(var y=0; y < hsvMats[0].height(); y++) {
        var indexX = Math.floor(bins*hsvMats[0].pixel(y,x)/180);
        var indexY = Math.floor(bins*hsvMats[1].pixel(y,x)/256);
        hueSatHistogram[indexX][indexY]++;
      }
    }

    var topResults = getTopEntries2D(hueSatHistogram, colours);
    //Saturations should be a minimum amount (TODO should they tho??)
    topResults = topResults.map(function(e) {
      return [e[0]/bins, 0.3 + 0.7*e[1]/bins];
    });

    //Finally send new hue and sat functions to LEDs
    //Plot a set of linear functions to calculate expected hue
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
      var xdiff = length/colours;
      var binLoc = Math.floor(i/xdiff);
      var l = topResults[binLoc][0],
          r = topResults[(binLoc+1)%colours][0];
      //Need to account for the "wrapping" nature of hues
      if(l-r > 0.5) {
        r++;
      } else if(r-l > 0.5) {
        l++;
      }
      //Generate a line between two nearest points
      var ydiff = r - l;
      var m = ydiff/xdiff;
      var c = l - m*xdiff*binLoc;
      //Need the modulo to again account for wrapping nature
      return (m*i + c)%1;
    });

    //Do the same for saturation
    led.setSat(function(i, length, t) {
      i = (i + Math.floor(t/6))%length;
      var xdiff = length/colours;
      var binLoc = Math.floor(i/xdiff);
      var l = topResults[binLoc][1],
          r = topResults[(binLoc+1)%colours][1];
      //Need to account for the "wrapping" nature of hues
      if(l-r > 0.5) {
        r++;
      } else if(r-l > 0.5) {
        l++;
      }
      //Generate a line between two nearest points
      var ydiff = r - l;
      var m = ydiff/xdiff;
      var c = l - m*xdiff*binLoc;
      //Need the modulo to again account for wrapping nature
      return (m*i + c)%1;
    });

    return callback();

  });
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

var getTopEntries2D = function(arr, n) {
  var maxes = zeros([n]),
      maxIndexes = zeros([n,2]);
  for(var x=0; x<arr.length; x++) {
    for(var y=0; y<arr[x].length; y++) {
      for(var i=0; i<n; i++) {
        if(arr[x][y] > maxes[i]) {
          maxes[i] = arr[x][y];
          maxIndexes[i][0] = x;
          maxIndexes[i][1] = y;
          maxes.sort(function(a, b) { 
            return b - a;
          });
          break;
        }
      }
    }
  }
  return maxIndexes;
};


//Function to generate a zero filled array
var zeros = function(dimensions) {
    var array = [];

    for (var i = 0; i < dimensions[0]; ++i) {
        array.push(dimensions.length == 1 ? 0 : zeros(dimensions.slice(1)));
    }

    return array;
}
