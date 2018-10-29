'use strict';

/* Controllers */
// profile controller
app.controller('ProfileFormController', [
  '$scope',
  '$state',
  '$rootScope',
  'API',
  'growl',
  'Delay',
  'Geosearch',
  'NetminoUtils',
  function($scope,
           $state,
           $rootScope,
           API,
           growl,
           Delay,
           Geosearch,
           NetminoUtils) {

    // PRIVATE METHODS
    var prevState = {
      name: 'app.page.events'
    };

    var initUserProfile = function() {
      API.Users.getUserById($state.params.id).success(function(res) {
        $scope.currentUser = res.data;
        $scope.userModel = angular.copy($scope.currentUser);
        var networks = ['facebook', 'google'];
        $scope.isNetworkLogin = false;
        for (var i = 0; i < networks.length; i++) {
          if ($scope.currentUser[networks[i]]) {
            $scope.isNetworkLogin = true;
            break;
          }
        }
      }).error(NetminoUtils.handleError);
    };

    // SCOPE METHODS

    $scope.cancelProfile = function() {
      $state.go(prevState.name);
    };

    $scope.changePassword = function(password, confirmPassword) {

      API.Users.updatePassword($scope.userModel._id, {
        password: password,
        confirmPassword: confirmPassword
      }).success(function(data) {
        if (data.error) {
          growl.addErrorMessage(data.error.message);
        } else {
          growl.addInfoMessage('Password changed.');
        }
      }).error(NetminoUtils.handleError);
    };

    $scope.geoSearch = function(geoSearchTxt, form) {
      $scope.locationNotFound = false;
      // Avoid flooding the geosearch XHR call.
      Delay.execute(function() {
        Geosearch.search(geoSearchTxt, function(loc) {
          $scope.userModel.location = loc;
          form.$invalid = false;
        }, function() {
          if (geoSearchTxt) {
            form.$invalid = true;
          }
          $scope.userModel.location = {};
          $scope.locationNotFound = true;
        });
      }, 1000);
    };

    $scope.updateProfile = function(userModel) {
      API.Users.updateProfile(userModel._id, {
        email: userModel.email,
        gender: userModel.gender,
        location: userModel.location,
        name: userModel.name
      }).success(function(data) {
        if (data.error) {
          growl.addErrorMessage(data.error.message);
        } else {
          growl.addInfoMessage('Profile updated.');
          $scope.currentUser.location = $scope.userModel.location;
          if ($rootScope.user._id === data.user._id) {
            $rootScope.$broadcast('user is authenticated', data.user);
          }
        }
      }).error(NetminoUtils.handleError);
    };

    //EVENTS
    $scope.$on('$stateChangeSuccess', function(ev, to, toParams, from) {
      if (from.name !== '') {
        prevState = from;
      }
    });

    // INIT
    initUserProfile();
  }]);
