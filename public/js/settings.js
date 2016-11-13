//Angular app
var app = angular.module('myApp', []);

app.controller('myCtrl', function($scope, $http) {
  $scope.watcherStatus = 'Running';
  $scope.currentAlbumStatus = '';

  setInterval(function() {
    $http.get('/api/music/status')
      .then(function(res) {
        $scope.watcherStatus = res.data.status;
        $http.get('/api/settings/album')
        .then(function(res) {
          $scope.currentAlbumStatus = res.data;
        });
    });
  }, 1000);

  $scope.post = function(endpoint) {
    $http.post('/api/' + endpoint);
  };

  

});
