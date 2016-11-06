//Angular app
var app = angular.module('myApp', ['ngAnimate']);

app.controller('myCtrl', function($scope, $http, socket) {
  $scope.values = [];
  for(var i=0;i<256;i++){
    $scope.values[i] = 0;
  }

  //Function to get the string for rgb for each pixel
  $scope.readingToHex = function(x) {
    //rgb = HSVtoRGB((2.0/3)* (1 - (Math.abs(x-$scope.min)/Math.abs(x-$scope.max))), 1, 1);
    return '#' +
           paddedToString(x.r) + 
           paddedToString(x.g) + 
           paddedToString(x.b);
  };

  socket.on('reading', function (data) {
    $scope.values = data.readings;
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
