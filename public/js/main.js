//Angular app
var app = angular.module('myApp', ['ngAnimate']);

app.controller('myCtrl', function($scope, $http, socket) {
  $scope.values = [];
  $scope.max = 100000;
  $scope.min = 0;
  for(var i=0;i<256;i++){
    $scope.values[i] = i;
  }

  //Function to get the string for rgb for each pixel
  $scope.readingToHex = function(x) {
    rgb = HSVtoRGB(Math.abs(x-$scope.min)/Math.abs(x-$scope.max), 1, 1);
    return '#' +
           paddedToString(rgb.r) + 
           paddedToString(rgb.g) + 
           paddedToString(rgb.b);
  };

  socket.on('reading', function (data) {
    $scope.values = data.readings;
    $scope.max = data.max;
    $scope.min = data.min;
  });

  $scope.valueToStyle = function(x) {
    return {
      "background-color": $scope.readingToHex(x)
    };
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

//Courtesy of Paul S., from stackoverflow
function HSVtoRGB(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
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
