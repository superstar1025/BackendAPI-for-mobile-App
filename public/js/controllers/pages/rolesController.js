'use strict';

/* Controllers */
// User roles controller
app.controller('RolesController', [
  '$scope',
  '$modal',
  'growl',
  'API',
  'NetminoUtils',
  function($scope,
           $modal,
           growl,
           API,
           NetminoUtils) {

    //SCOPE METODS

    $scope.addNewRole = function() {
      var modalInstance = $modal.open({
        templateUrl: '../../../tpl/modals/new_role_modal.html',
        controller: 'NewRoleModalController',
        size: 'lg'
      });

      modalInstance.result.then(function(msg) {
        growl.addInfoMessage(msg);
        loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
      });
    };

    $scope.deactivateRole = function(role, isActive) {
      var modalInstance = $modal.open({
        templateUrl: '../../../tpl/modals/confirm_modal.html',
        controller: 'ConfirmRoleDeactivationModalController',
        size: 'sm'
      });

      modalInstance.result.then(function() {
        $scope.toggleRole(role, isActive);
      });
    };
    $scope.toggleRole = function(role, isActive) {
      API.Roles.toggleRole(role._id, {is_active: isActive}).success(function(res) {
        role.is_active = !role.is_active;
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

        API.Roles.getRoles(query).success(function(res) {
          $scope.roles = res.data;
          $scope.totalServerItems = res.total;
        }).error(NetminoUtils.handleError);
      }, 100);
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
      data: 'roles',
      enablePaging: true,
      showFooter: true,
      totalServerItems: 'totalServerItems',
      pagingOptions: $scope.pagingOptions,
      filterOptions: $scope.filterOptions,
      enableRowSelection: false,
      columnDefs: [
        {field: 'description', displayName: 'Name'},
        {
          displayName: 'Action',
          sortable: false,
          cellClass: 'cellToolTip',
          cellTemplate: '/tpl/datagrids/page_roles_ct.html',
          width: 110
        }],
      rowHeight: 40
    };

    $scope.totalServerItems = 0;
    //INIT

    loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

  }]);
