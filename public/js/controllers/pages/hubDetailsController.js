'use strict';

/* Controllers */
// hub details controller
app.controller('HubDetailsController', [
  '$scope',
  '$rootScope',
  'API',
  '$state',
  'NetminoUtils',
  function($scope,
           $rootScope,
           API,
           $state,
           NetminoUtils) {

    //PRIVATE STUFF

    var hubFollowersCallback = function(data) {
      $scope.hubFollowers = data;
    };

    var initHub = function(id) {
      API.Hubs.getHubById(id).success(function(data) {
        $scope.hub = data.hub;
      }).error(NetminoUtils.handleError);
    };

    var loadHubEvents = function(id) {

    };

    var loadHubFollowers = function(id, size, page) {
      var query = {
        size: size,
        page: page,
        sort: '-date_followed'
      };

      if (!$rootScope.isSignedIn) {
        API.Hubs.getHubPublicFollowers(id, query)
          .success(hubFollowersCallback).error(NetminoUtils.handleError);
      } else {
        API.Hubs.getHubFollowers(id, query)
          .success(hubFollowersCallback).error(NetminoUtils.handleError);
      }
    };

    var loadHubBusinesses = function(id) {
      API.BusinessProfiles.getTopBusinesses(10).success(function(res) {
        $scope.hubBusinesses = res.profiles;
      }).error(NetminoUtils.handleError);
    };

    var prevState = {
      name: 'app.page.events'
    };

    //SCOPE METHODS

    $scope.followHub = function(id) {
      API.Hubs.followHub(id, $rootScope.user._id).success(function(data) {
        $scope.isHubFollowed = data.follower;
        $scope.hubFollowers.followers.unshift(data.follower);
        $scope.hubFollowers.total++;
      }).error(NetminoUtils.handleError)
    };

    $scope.goBack = function() {
      $state.go(prevState.name);
    };

    $scope.goToProfileSubscription = function(id) {
      $state.go('app.page.business_profile_subscription', {id: id});
    };

    $scope.unfollowHub = function(id) {
      API.Hubs.unfollowHub(id, $rootScope.user._id).success(function(data) {
        $scope.isHubFollowed = null;
        $scope.hubFollowers.followers = _.reject($scope.hubFollowers.followers, function(el) {
          return $rootScope.user._id === el.user._id;
        });
        $scope.hubFollowers.total--;
      }).error(NetminoUtils.handleError);
    };

    //EVENTS

    $scope.$on('$stateChangeSuccess', function(ev, to, toParams, from) {
      if (from.name !== '') {
        prevState = from;
      }
    });

    //INIT

    $scope.pagingOptions = {
      businesses: {
        pageSize: 10,
        currentPage: 1
      },
      followers: {
        pageSize: 10,
        currentPage: 1
      }
    };

    $scope.hubId = $state.params.id;
    initHub($scope.hubId);
    loadHubFollowers($scope.hubId, $scope.pagingOptions.followers.pageSize, $scope.pagingOptions.followers.currentPage);
    loadHubEvents($scope.hubId);
    loadHubBusinesses($scope.hubId);

    if ($rootScope.isSignedIn) {
      API.Hubs.isHubFollowedByUser($scope.hubId, $rootScope.user._id)
        .success(function(data) {
          $scope.isHubFollowed = data.follower;
        }).error(NetminoUtils.handleError);
    }
  }]);
