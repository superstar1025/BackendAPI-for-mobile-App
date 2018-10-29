'use strict';

/* Controllers */
// signin controller
app.controller('SigninFormController', [
  '$scope',
  '$location',
  '$rootScope',
  'API',
  '$auth',
  function($scope,
           $location,
           $rootScope,
           API,
           $auth) {

    // SCOPE METHODS

    $scope.authenticate = function(provider) {
      $auth.authenticate(provider).then(function(res) {
        $rootScope.$broadcast('user is authenticated', res.data.token);
      }, function(err) {
        $scope.authError = 'Authentication failed!'
      });
    };

    $scope.login = function() {
      $scope.authError = null;
      $auth.login({email: $scope.user.email, password: $scope.user.password}).then(function(response) {
        $rootScope.$broadcast('user is authenticated', response.data.token);
      }, function(response) {
        $scope.authError = response.data.error.message;
      });
    };

    //OPTIONS

    $scope.authError = null;
    $scope.user = {};

    //INIT

    if ($rootScope.isSignedIn) {
      $location.path('/');
      return;
    }
  }]);
