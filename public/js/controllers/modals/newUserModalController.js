'use strict';

/* Controllers */
// New user modal controller
app.controller('NewUserModalController', [
  '$scope',
  '$modalInstance',
  'API',
  'growl',
  'NetminoUtils',
  function(
    $scope,
    $modalInstance,
    API,
    growl,
    NetminoUtils) {

    $scope.ok = function() {
      API.Users.addNewUser($scope.new_user).success(function(data) {
        if (data.error) {
          growl.addErrorMessage(data.error.message);
        } else {
          $modalInstance.close(data.message);
        }
      }).error(NetminoUtils.handleError);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };

    API.Roles.getRoles().success(function(res) {
      $scope.roles = res.data;
      $scope.new_user = {
        role: $scope.roles[0]
      };
    }).error(NetminoUtils.handleError);;

  }]);
