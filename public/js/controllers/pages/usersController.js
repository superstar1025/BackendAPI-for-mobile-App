'use strict';

/* Controllers */
// users controller
app.controller('UsersController', [
  '$scope',
  '$state',
  '$modal',
  'growl',
  'API',
  '$filter',
  'editableOptions',
  'NetminoUtils',
  function($scope,
           $state,
           $modal,
           growl,
           API,
           $filter,
           editableOptions,
           NetminoUtils) {

    //SCOPE METHODS

    $scope.addNewUser = function() {
      var modalInstance = $modal.open({
        templateUrl: '../../../tpl/modals/new_user_modal.html',
        controller: 'NewUserModalController',
        size: 'lg'
      });

      modalInstance.result.then(function(msg) {
        growl.addInfoMessage(msg);
        loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
      });
    };

    $scope.editUser = function(user) {
      $state.go('app.page.profile', {id: user._id});
    };

    $scope.toggleAccount = function(user, isActive) {
      API.Users.toggleAccount(user._id, {is_active: isActive}).success(function(res) {
        user.is_active = !user.is_active;
      }).error(NetminoUtils.handleError);
    };

    $scope.updateRole = function(role, userId) {
      return API.Users.updateRole(userId, {role: role}).success(function(res) {
        growl.addInfoMessage(res.message);
      }).error(NetminoUtils.handleError);
    };

    //PRIVATE METHODS

    var loadGridData = function(pageSize, page, searchText) {
      var query = {
        size: pageSize,
        page: page,
        filter: searchText
      };
      setTimeout(function() {
        API.Users.getUsers(query).success(function(data) {
          $scope.users = data.users;
          $scope.totalServerItems = data.total;
        }).error(NetminoUtils.handleError);
      }, 500);
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

    //OPTIONS

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
      data: 'users',
      enablePaging: true,
      showFooter: true,
      totalServerItems: 'totalServerItems',
      pagingOptions: $scope.pagingOptions,
      filterOptions: $scope.filterOptions,
      enableRowSelection: false,
      columnDefs: [
        {field: 'name', displayName: 'Username'},
        {field: 'date_created', displayName: 'Date created', cellFilter: 'date: "dd-MMM-yyyy"'},
        {field: 'is_active', displayName: 'Status', cellFilter: 'toStatusStr'},
        {
          displayName: 'Role',
          cellTemplate: '/tpl/datagrids/page_users_role_ct.html'
        },
        {
          displayName: 'Actions',
          sortable: false,
          cellClass: 'cellToolTip',
          cellTemplate: '/tpl/datagrids/page_users_actions_ct.html',
          width: 110
        }],
      rowHeight: 40
    };

    $scope.showStatus = function() {
      var selected = $filter('filter')($scope.statuses, {value: $scope.user.status});
      return ($scope.user.status && selected.length) ? selected[0].text : 'Not set';
    };

    $scope.totalServerItems = 0;

    editableOptions.theme = 'bs3';

    //INIT

    API.Roles.getRoles().success(function(res) {
      $scope.roles = res.data;
      loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
    }).error(NetminoUtils.handleError);

  }]);
