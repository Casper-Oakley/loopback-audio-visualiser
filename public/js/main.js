//Angular app
var app = angular.module('myApp', ['ngAnimate']);

app.controller('myCtrl', function($scope, $http, socket) {

  $scope.currentColour = [];
  $scope.values = [];
  $scope.album = '';
  $scope.albums = [];
  $scope.bins_count = 16;
  $scope.colour_count = 4;

  for(var i=0;i<256;i++){
    $scope.values[i] = 0;
  }

  //Function to get the string for rgb for each pixel
  $scope.readingToHex = function(x) {
    return '#' +
           paddedToString(x.r) + 
           paddedToString(x.g) + 
           paddedToString(x.b);
  };

  $scope.log = function(x) {
    console.log(x);
  };

  socket.on('reading', function (data) {
    $scope.values = data.readings;
  });
  
  $scope.toColour = function(hex) {
    var rgb = hexToRgb(hex);
    var hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
    $http({
      method: 'POST',
      url: '/api/settings/colour',
      data: {
        hue: hsv.h,
        sat: hsv.s
      }
    });
  };

  $scope.toDefault = function() {
    $http({
      method: 'POST',
      url: '/api/settings/default'
    });
  };

  $scope.valueToStyle = function(x) {
    return {
      "background-color": $scope.readingToHex(x)
    };
  };


  $scope.search = function(x) {
    $http({
      method: 'GET',
      url: 'http://ws.audioscrobbler.com/2.0/?method=album.search&api_key=351f3b3acf21f9eeb961fe76241f686c&album=' + x + '&format=json&limit=5'
    }).then(function(res) {
      $scope.albums = res.data.results.albummatches.album.map(function(e) {
        return {
         text   : e.artist + ': ' + e.name,
         img_sm : e.image[0]['#text'],
         img_lg : e.image[e.image.length-1]['#text'],
         checked   : false
        };
        
      });
    }, function(res) {
      $scope.albums = ['Invalid', 'Albums'];
    });
  };

  $scope.updateSelection = function(ind, collection) {
    angular.forEach(collection, function(e, i) {
      e.checked = i==ind;
    });
    var album = collection[ind];
    $http({
      method: 'POST',
      url:    '/api/settings/album',
      data: {
        url: album.img_lg,
        bins: parseInt($scope.bins_count),
        colours: parseInt($scope.colour_count),
      }
    });
  };

});

//Function to add a padded 0 if value less than 16
function paddedToString(x, n) {
  if(x < 16) {
    return '0' + x.toString(16);
  } else {
    return x.toString(16);
  }
};


//Function courtesy of Tim Down of stackoverflow
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}


//Function courtesy of m jackson of github
function rgbToHsv(r, g, b) {
  r /= 255, g /= 255, b /= 255;

  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, v = max;

  var d = max - min;
  s = max == 0 ? 0 : d / max;

  if (max == min) {
    h = 0; // achromatic
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }

    h /= 6;
  }
  return {
    h: h,
    s: s,
    v: v
  };
}



//Factory causing reapplies on any on event and emit event firing
app.factory('socket', function ($rootScope) {
  var socket = io.connect('http://localhost:3000');
  return {
    on: function (eventName, callback) {
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    }
  };
});

