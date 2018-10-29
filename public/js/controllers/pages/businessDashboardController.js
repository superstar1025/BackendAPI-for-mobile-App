'use strict';

/* Controllers */
// business provider dashboard controller
app.controller('BusinessDashboardController', [
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

    // SCOPE METHODS

    $scope.loadData = function(query) {

      API.Users.getUsers(query).success(function(data) {
        $scope.totalUsers = data.total;
      }).error(NetminoUtils.handleError);

      API.Events.getAllEvents(query).success(function(data) {
        $scope.totalEvents = data.total;
      }).error(NetminoUtils.handleError);

      API.Hubs.getHubs(query).success(function(data) {
        $scope.totalHubs = data.total;
      }).error(NetminoUtils.handleError);

      API.BusinessProfiles.getBusinessProfiles(query).success(function(res) {
        $scope.totalBusinessProfiles = res.total;
      }).error(NetminoUtils.handleError);
    };

    //OPTIONS

    $scope.pagingOptions = {
      size: 1,
      page: 1
    };

    // INIT
    $scope.loadData($scope.pagingOptions);

    if (!$rootScope.isBusinessProvider) {
      $state.go('app.page.events');
    }

  }]);
