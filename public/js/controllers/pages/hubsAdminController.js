'use strict';

/* Controllers */
// Hubs controller (admin mode)
app.controller('HubsAdminController', [
  '$scope',
  '$rootScope',
  '$modal',
  'growl',
  'API',
  'NetminoUtils',
  function($scope,
           $rootScope,
           $modal,
           growl,
           API,
           NetminoUtils) {

    //PRIVATE METHODS

    var loadGridData = function(pageSize, page, searchText) {
      var query = {
        size: pageSize,
        page: page,
        name: searchText,
        filter: $scope.hubsFilter
      };
      setTimeout(function() {
        API.Hubs.getHubs(query).success(function(data) {
          $scope.hubs = data.hubs;
          $scope.totalServerItems = data.total;
        }).error(NetminoUtils.handleError);
      }, 100);
    };

    var mopdalCallback = function(msg) {
      growl.addInfoMessage(msg);
      loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    };

    var updateHubsList = function(newVal, oldVal) {
      if (newVal !== oldVal) {
        loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
      }
    };

    //SCOPE METODS

    $scope.addNewHub = function() {
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
        size: 'lg',
        resolve: {
          hub: function() {
            return angular.copy(hub);
          }
        }
      });

      modalInstance.result.then(mopdalCallback);
    };

    $scope.followHub = function(item) {
      API.Hubs.followHub(item.hub._id, $rootScope.user._id).success(function(res) {
        item.isFollowed = true;
      }).error(NetminoUtils.handleError);
    };

    $scope.muteHub = function(item) {
      API.Hubs.muteHub(item.hub._id, $rootScope.user._id).success(function(res) {
        item.isMuted = true;
      }).error(NetminoUtils.handleError)
    };

    $scope.toggleHub = function(hub, isActive) {
      API.Hubs.toggleHub(hub._id, {is_active: isActive}).success(function(res) {
        hub.is_active = !hub.is_active;
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

    // WATCHERS

    $scope.$watch('filterOptions', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
      }
    }, true);

    $scope.$watch('pagingOptions', function(newVal, oldVal) {
      if (newVal.pageSize !== oldVal.pageSize || newVal.currentPage !== oldVal.currentPage) {
        loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
      }
    }, true);

    $scope.$watch('hubsFilter', updateHubsList);

    //OPTIONS

    $scope.filterOptions = {
      filterText: '',
      useExternalFilter: true
    };

    $scope.pagingOptions = {
      pageSizes: [3, 10, 20, 30],
      pageSize: 10,
      currentPage: 1
    };

    $scope.gridOptions = {
      data: 'hubs',
      enablePaging: true,
      showFooter: true,
      totalServerItems: 'totalServerItems',
      pagingOptions: $scope.pagingOptions,
      filterOptions: $scope.filterOptions,
      enableRowSelection: false,
      columnDefs: [
        {field: 'hub.name', displayName: 'Name'},
        {
          displayName: 'Social Actions',
          sortable: false,
          cellClass: 'cellToolTip',
          cellTemplate: '/tpl/datagrids/page_hubs_social_actions_ct.html',
          width: 110
        },
        {
          displayName: 'Actions',
          sortable: false,
          cellClass: 'cellToolTip',
          cellTemplate: '/tpl/datagrids/page_hubs_actions_ct.html',
          width: 110
        }],
      rowHeight: 40
    };

    $scope.totalServerItems = 0;
    //INIT

    $scope.hubsFilter = 'all';
    loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

  }]);
