'use strict';

/* Controllers */
// admin dashboard controller$
app.controller('AdminDashboardController', [
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

    // PRIVATE STUFF

    function div(val, by) {
      return (val - val % by) / by;
    }

    // SCOPE METHODS

    $scope.loadData = function(query) {
      API.Activities.getActivities(query).success(function(res) {
        $scope.activities = $scope.activities.concat(res.data);
        $scope.totalServerItems = res.total;
        $scope.pagingOptions.page++;
      }).error(NetminoUtils.handleError);

      API.Users.getUsers({
        size: 1,
        page: 1
      }).success(function(data) {
        $scope.totalUsers = data.total;
        var pages = div($scope.totalUsers, 5);
        var page = Math.floor((Math.random() * pages) + 1);
        API.Users.getUsers({
          size: 5,
          page: page
        }).success(function(data) {
          $scope.users = data.users;
        }).error(NetminoUtils.handleError);
      }).error(NetminoUtils.handleError);

      API.Users.getTotalUsersByRoles().success(function(res) {
        $scope.roleEntries = res.data;
      }).error(NetminoUtils.handleError);

      API.Events.getAllEvents({
        size: 1,
        page: 1
      }).success(function(data) {
        $scope.totalEvents = data.total;
      }).error(NetminoUtils.handleError);

      API.Hubs.getHubs({
        size: 1,
        page: 1
      }).success(function(data) {
        $scope.totalHubs = data.total;
      }).error(NetminoUtils.handleError);

      API.BusinessProfiles.getBusinessProfiles({
        size: 1,
        page: 1
      }).success(function(res) {
        $scope.totalBusinessProfiles = res.total;
      }).error(NetminoUtils.handleError);

    };

    //OPTIONS

    $scope.pagingOptions = {
      size: 4,
      page: 1
    };

    // INIT
    $scope.activities = [];
    $scope.loadData($scope.pagingOptions);

    if (!$rootScope.isAdmin) {
      $state.go('app.page.events');
    }

  }]);
