'use strict';

/* Controllers */
// New tag modal controller
app.controller('NewTagModalController', [
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
      API.Tags.addNewTag($scope.new_tag).success(function(data) {
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
    $scope.new_tag = {};
  }]);
