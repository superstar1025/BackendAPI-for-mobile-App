'use strict';

/* Controllers */
// Hubs controller (admin mode)
app.controller('HubsController', [
  '$scope',
  '$rootScope',
  '$modal',
  '$state',
  'growl',
  'API',
  'NetminoUtils',
  function($scope,
           $rootScope,
           $modal,
           $state,
           growl,
           API,
           NetminoUtils) {

    //PRIVATE STUFF
    var getAllHubs = function() {
      API.Hubs.getHubs({filter: $scope.hubsFilter}).success(function(data) {
        $scope.allHubs = data.hubs;
        $scope.allHubs.unshift({
          hub: {
            _id: null
          }
        });
      }).error(NetminoUtils.handleError);
    };

    var mopdalCallback = function(msg) {
      growl.addInfoMessage(msg);
      getAllHubs();
    };

    var updateHubsList = function(newVal, oldVal) {
      if (newVal !== oldVal) {
        getAllHubs();
      }
    };

    //SCOPE METODS

    $scope.createNewHub = function() {
      var modalInstance = $modal.open({
        templateUrl: '../../../tpl/modals/hub_modal.html',
        controller: 'HubModalController',
        size: 'lg',
        resolve: {
          hub: function() {
            return null;
          }
        }
      });

      modalInstance.result.then(mopdalCallback);
    };

    $scope.editHub = function(hub) {
      var modalInstance = $modal.open({
        templateUrl: '../../../tpl/modals/hub_modal.html',
        controller: 'HubModalController',
        resolve: {
          hub: function() {
            return angular.copy(hub);
          }
        },
        size: 'lg'
      });

      modalInstance.result.then(mopdalCallback);
    };

    $scope.followHub = function(item) {
      API.Hubs.followHub(item.hub._id, $rootScope.user._id).success(function(res) {
        item.isFollowed = true;
      }).error(NetminoUtils.handleError);
    };

    $scope.goToHubDetais = function(id) {
      $state.go('app.page.hubDetails', {id: id});
    };

    $scope.muteHub = function(item) {
      API.Hubs.muteHub(item.hub._id, $rootScope.user._id).success(function(res) {
        item.isMuted = true;
      }).error(NetminoUtils.handleError);
    };

    $scope.unfollowHub = function(item) {
      API.Hubs.unfollowHub(item.hub._id, $rootScope.user._id).success(function(res) {
        item.isFollowed = false;
      }).error(NetminoUtils.handleError);
    };

    $scope.unmuteHub = function(item) {
      API.Hubs.unmuteHub(item.hub._id, $rootScope.user._id).success(function(res) {
        item.isMuted = false;
      }).error(NetminoUtils.handleError);
    };

    //WATCHERS
    $scope.$watch('hubsFilter', updateHubsList);

    //INIT
    $scope.hubsFilter = 'all';
    getAllHubs();
  }]);
