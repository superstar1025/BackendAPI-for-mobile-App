'use strict';

app.controller('HubModalController', [
  '$scope',
  '$modalInstance',
  'API',
  'growl',
  'hub',
  'NetminoUtils',
  function(
    $scope,
    $modalInstance,
    API,
    growl,
    hub,
    NetminoUtils) {

    $scope.datepickers = {};
    $scope.new_hub = hub || {};

    if (!$scope.new_hub._id) {
      $scope.new_hub.start_datetime = new Date();
      $scope.new_hub.end_datetime = new Date();
    }

    $scope.open = function($event, which) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.datepickers.from = false;
      $scope.datepickers.to = false;
      $scope.datepickers[which] = true;
    };

    $scope.createHub = function(hub) {
      API.Hubs.addNewHub(hub).success(function(data) {
        if (data.error) {
          growl.addErrorMessage(data.error.message);
        } else {
          $modalInstance.close(data.message);
        }
      }).error(NetminoUtils.handleError);
    };

    $scope.updateHub = function(hub) {
      API.Hubs.updateHub(hub._id, hub).success(function(data) {
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

  }]);
