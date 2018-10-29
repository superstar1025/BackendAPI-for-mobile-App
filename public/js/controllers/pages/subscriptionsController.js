'use strict';

/* Controllers */
// Subscriptions controller
app.controller('SubscriptionsController', [
  '$scope',
  '$rootScope',
  'API',
  'NetminoUtils',
  function($scope,
           $rootScope,
           API,
           NetminoUtils) {

    //PRIVATE STUFF

    var loadBusinessProfiles = function(size, page, searchText) {
      var query = {
        size: size,
        page: page,
        filter: searchText,
        sort: 'name'
      };
      setTimeout(function() {
        API.BusinessProfiles.getBusinessProfilesSubscription(query).success(function(data) {
          $scope.items = data;
        }).error(NetminoUtils.handleError);
      }, 500);
    };

    //SCOPE METHODS

    $scope.follow = function(profileEntry) {
      API.BusinessProfiles.followBusinessProfile(profileEntry.profile._id, $rootScope.user._id)
        .success(function(data) {
          profileEntry.isISubscribed = true;
        }).error(NetminoUtils.handleError);
    };

    $scope.filterOptions = {
      filterText: '',
      useExternalFilter: true
    };

    $scope.pagingOptions = {
      pageSizes: [10, 20, 30],
      pageSize: 10,
      currentPage: 1
    };

    $scope.gridOptions = {
      data: 'items.profiles',
      enablePaging: true,
      showFooter: true,
      totalServerItems: 'items.total',
      pagingOptions: $scope.pagingOptions,
      filterOptions: $scope.filterOptions,
      enableRowSelection: false,
      headerRowHeight: 0,
      columnDefs: [
        {
          sortable: false,
          cellTemplate: '/tpl/datagrids/page_subscriptions_ct.html'
        }
      ],
      rowHeight: 130
    };

    $scope.unfollow = function(profileEntry) {
      API.BusinessProfiles.unfollowBusinessProfile(profileEntry.profile._id, $rootScope.user._id)
        .success(function(data) {
          profileEntry.isISubscribed = false;
        }).error(NetminoUtils.handleError);
    };

    //WATCHERS

    $scope.$watch('filterOptions', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        loadBusinessProfiles($scope.pagingOptions.pageSize,
          $scope.pagingOptions.currentPage,
          $scope.filterOptions.filterText);
      }
    }, true);

    $scope.$watch('pagingOptions', function(newVal, oldVal) {
      if (newVal.pageSize !== oldVal.pageSize || newVal.currentPage !== oldVal.currentPage) {
        loadBusinessProfiles($scope.pagingOptions.pageSize,
          $scope.pagingOptions.currentPage,
          $scope.filterOptions.filterText);
      }
    }, true);

    //INIT
    loadBusinessProfiles($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

  }]);
