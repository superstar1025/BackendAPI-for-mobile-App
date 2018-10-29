'use strict';

/* Controllers */
// Event Details controller
app.controller('EventDetailsController', [
  '$scope',
  '$rootScope',
  '$state',
  'growl',
  'API',
  'NetminoUtils',
  function($scope,
           $rootScope,
           $state,
           growl,
           API,
           NetminoUtils) {

    //PRIVATE STUFF

    var initEvent = function(id) {

      API.Events.getEventById(id).success(function(data) {
        $scope.event = data.event;
        $scope.provider = data.business_provider;
        $scope.isMyEvent = $rootScope.isSignedIn && $scope.event.created_by._id === $rootScope.user._id;
        if ($scope.event.location) {
          $scope.center = {
            lat: $scope.event.location.lat,
            lng: $scope.event.location.lng,
            zoom: 15
          };
          $scope.markers = {
            eventMarker: {
              lat: $scope.event.location.lat,
              lng: $scope.event.location.lng
            }
          };
        }

        if ($rootScope.isSignedIn && $rootScope.user._id !== $scope.event.created_by._id) {
          API.Users.areUsersFriends($rootScope.user._id, $scope.event.created_by._id).success(function(data) {
            $scope.isFriend = data.friendships;
          }).error(NetminoUtils.handleError);
        }

        if ($scope.event.business) {
          API.BusinessProfiles.getBusinessProfileById($scope.event.business._id).success(function(data) {
            $scope.event.business = data;
            if ($rootScope.isSignedIn) {
              API.BusinessProfiles
                .isBusinessProfileFollowedByUser($scope.event.business._id, $rootScope.user._id)
                .success(function(data) {
                  $scope.isProfileFollowed = data.follower;
                }).error(NetminoUtils.handleError);
            }
          }).error(NetminoUtils.handleError);
        }
      }).error(NetminoUtils.handleError);
    };

    var prevState = {
      name: 'app.page.events'
    };

    //SCOPE METHODS

    $scope.addAsFriend = function(id) {
      API.Users.addUserAsFriend($rootScope.user._id, id).success(function(data) {
        $scope.isFriend = data.friendships;
      }).error(NetminoUtils.handleError);
    };

    $scope.removeFriend = function(id) {
      API.Users.removeFriend($rootScope.user._id, id).success(function(data) {
        $scope.isFriend = null;
      }).error(NetminoUtils.handleError);
    };

    $scope.followBusinessProfile = function(id) {
      API.BusinessProfiles.followBusinessProfile(id, $rootScope.user._id).success(function(data) {
        growl.addInfoMessage(data.message);
        $scope.isProfileFollowed = data.follower;
      }).error(NetminoUtils.handleError);
    };

    $scope.unfollowBusinessProfile = function(id) {
      API.BusinessProfiles.unfollowBusinessProfile(id, $rootScope.user._id).success(function(data) {
        growl.addInfoMessage(data.message);
        $scope.isProfileFollowed = null;
      }).error(NetminoUtils.handleError);
    };

    //EVENTS
    $scope.$on('$stateChangeSuccess', function(ev, to, toParams, from) {
      if (from.name !== '') {
        prevState = from;
      }
    });

    //INIT
    var eventId = $state.params.id;
    initEvent(eventId);
  }]);
