'use strict';

/* Controllers */
// Confirm deactivate role modal controller
app.controller('ConfirmRoleDeactivationModalController', ['$scope', '$modalInstance',
  function($scope, $modalInstance) {

    $scope.ok = function() {
      $modalInstance.close();
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
    $scope.new_role = {};
  }]);
