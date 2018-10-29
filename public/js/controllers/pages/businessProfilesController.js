'use strict';

/* Controllers */
// Business profiles controller
app.controller('BusinessProfilesController', [
  '$scope',
  '$state',
  'growl',
  'API',
  '$timeout',
  'NetminoUtils',
  function($scope,
           $state,
           growl,
           API,
           $timeout,
           NetminoUtils) {

    //SCOPE METODS

    $scope.goToBusinessProfilePage = function(profileId) {
      $state.go('app.page.business_profile', {userId: $scope.selectedUser._id, profileId: profileId});
    };

    $scope.selectUser = function(user) {
      $scope.selectedUser = user;
      loadProfilesGridData($scope.selectedUser._id,
        $scope.profilesPagingOptions.pageSize,
        $scope.profilesPagingOptions.currentPage);
    };

    //PRIVATE METHODS

    var loadUsersGridData = function(pageSize, page, searchText) {
      var query = {
        size: pageSize,
        page: page,
        filter: searchText,
        role: 'business_provider'
      };
      setTimeout(function() {
        API.Users.getUsers(query).success(function(data) {
          $scope.users = data.users;
          $scope.totalUsersServerItems = data.total;
          $timeout(function() {
            $scope.usersGridOptions.selectRow(0, true);
          });
        }).error(NetminoUtils.handleError);
      }, 100);
    };

    var loadProfilesGridData = function(userID, pageSize, page, searchText) {
      var query = {
        size: pageSize,
        page: page,
        filter: searchText
      };
      setTimeout(function() {
        API.BusinessProfiles.getBusinessProfilesByUserId(userID, query).success(function(data) {
          $scope.profiles = data.profiles;
          $scope.totalProfilesServerItems = data.total;
        }).error(NetminoUtils.handleError);
      }, 100);
    };

    // WATCHERS

    $scope.$watch('usersFilterOptions', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        loadUsersGridData($scope.usersPagingOptions.pageSize,
          $scope.usersPagingOptions.currentPage,
          $scope.usersFilterOptions.filterText);
      }
    }, true);

    $scope.$watch('usersPagingOptions', function(newVal, oldVal) {
      if (newVal.pageSize !== oldVal.pageSize || newVal.currentPage !== oldVal.currentPage) {
        loadUsersGridData($scope.usersPagingOptions.pageSize,
          $scope.usersPagingOptions.currentPage,
          $scope.usersFilterOptions.filterText);
      }
    }, true);

    $scope.$watch('profilesFilterOptions', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        loadProfilesGridData($scope.selectedUser._id,
          $scope.profilesPagingOptions.pageSize,
          $scope.profilesPagingOptions.currentPage,
          $scope.profilesFilterOptions.filterText);
      }
    }, true);

    $scope.$watch('profilesPagingOptions', function(newVal, oldVal) {
      if (newVal.pageSize !== oldVal.pageSize || newVal.currentPage !== oldVal.currentPage) {
        loadProfilesGridData($scope.selectedUser._id,
          $scope.profilesPagingOptions.pageSize,
          $scope.profilesPagingOptions.currentPage,
          $scope.profilesFilterOptions.filterText);
      }
    }, true);

    $scope.$watch('selectedRows', function(val) {
      if (val.length > 0) {
        $scope.selectUser(val[0]);
      }
    }, true);

    //OPTIONS

    $scope.usersFilterOptions = {
      filterText: '',
      useExternalFilter: true
    };

    $scope.usersPagingOptions = {
      pageSizes: [25, 30],
      pageSize: 25,
      currentPage: 1
    };

    $scope.selectedRows = [];
    $scope.usersGridOptions = {
      data: 'users',
      enablePaging: true,
      showFooter: true,
      totalServerItems: 'totalUserServerItems',
      pagingOptions: $scope.usersPagingOptions,
      filterOptions: $scope.usersFilterOptions,
      enableRowSelection: true,
      multiSelect: false,
      columnDefs: [
        {field: 'name', displayName: 'Name'},
        {field: 'date_created', displayName: 'Date Created', cellFilter: 'date: "dd-MMM-yyyy"'}
      ],
      rowHeight: 40,
      selectedItems: $scope.selectedRows
    };

    $scope.totalUserServerItems = 0;

    $scope.profilesFilterOptions = {
      filterText: '',
      useExternalFilter: true
    };

    $scope.profilesPagingOptions = {
      pageSizes: [10, 20, 30],
      pageSize: 10,
      currentPage: 1
    };

    $scope.profilesGridOptions = {
      data: 'profiles',
      enablePaging: true,
      showFooter: true,
      totalServerItems: 'totalProfilesServerItems',
      pagingOptions: $scope.profilesPagingOptions,
      filterOptions: $scope.profilesFilterOptions,
      enableRowSelection: false,
      columnDefs: [
        {field: 'name', displayName: 'Name'},
        {field: 'date_created', displayName: 'Date Created', cellFilter: 'date: "dd-MMM-yyyy"'},
        {
          displayName: 'Actions',
          sortable: false,
          cellClass: 'cellToolTip',
          cellTemplate: '/tpl/datagrids/page_business_profiles_ct.html',
          width: 110
        }
      ],
      rowHeight: 40
    };

    $scope.totalProfilesServerItems = 0;

    //INIT

    loadUsersGridData($scope.usersPagingOptions.pageSize, $scope.usersPagingOptions.currentPage);

  }]);
