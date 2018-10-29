'use strict';

/* Controllers */
// New role modal controller
app.controller('NewRoleModalController', [
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
      API.Roles.addNewRole($scope.new_role).success(function(data) {
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
    $scope.new_role = {};
  }]);
