'use strict';

/* Controllers */
// events controller
app.controller('EventsController', [
  '$scope',
  '$state',
  '$rootScope',
  'API',
  'NetminoUtils',
  function($scope,
           $state,
           $rootScope,
           API,
           NetminoUtils) {

    // PRIVATE METHODS

    var getTopBusinesses = function(count) {
      API.BusinessProfiles.getTopBusinesses(count).success(function(res) {
        $scope.topBusinesses = res.profiles;
      }).error(NetminoUtils.handleError);
    };

    var getTopHubs = function(count) {
      API.Hubs.getTopHubs(count).success(function(res) {
        $scope.topHubs = res.hubs;
      }).error(NetminoUtils.handleError);
    };

    var getTopLocations = function(count) {
      console.warn('getTopLocations is not ready yet!');
    };

    var loadEvents = function() {
      API.Events.getAllEvents({date: $scope.dt, filter: $scope.eventsFilter}).success(function(data) {
        $scope.events = data.events;
      }).error(NetminoUtils.handleError);
    };

    var updateEventsList = function(newVal, oldVal) {
      if (newVal !== oldVal) {
        loadEvents();
      }
    };

    //SCOPE METHODS

    $scope.goToHubDetais = function(id) {
      $state.go('app.page.hubDetails', {id: id});
    };

    $scope.goToProfileSubscription = function(id) {
      $state.go('app.page.business_profile_subscription', {id: id});
    };

    $scope.isMyEvent = function(event) {
      return $rootScope.isSignedIn && event.created_by === $rootScope.user._id;
    };

    //WATCHERS
    $scope.$watch('dt', updateEventsList);
    $scope.$watch('eventsFilter', updateEventsList);
    $scope.$watch('isSignedIn', function(val) {
      if (!val) {
        $scope.eventsFilter = 'all';
      }
    });

    // INIT

    $scope.eventsFilter = 'all';
    $scope.dt = new Date();
    loadEvents();
    getTopBusinesses(10);
    getTopHubs(10);
    getTopLocations(10);

  }]);
