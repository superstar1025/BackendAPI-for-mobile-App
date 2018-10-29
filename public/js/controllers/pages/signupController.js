'use strict';

// signup controller
app.controller('SignupFormController', [
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

    //SCOPE METHODS

    $scope.signup = function() {
      $scope.authError = null;
      // Try to create

      API.Auth.signup({
        name: $scope.user.name,
        email: $scope.user.email,
        password: $scope.user.password,
        confirmPassword: $scope.user.confirmPassword
      }).success(function(data) {
        if (!data.token) {
          $scope.authError = data.error.message;
        } else {
          $rootScope.$broadcast('user is authenticated', data.token);
          $auth.setToken(data.token, '/');
        }
      }).error(function(x) {
        $scope.authError = 'Authentication failed!';
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
