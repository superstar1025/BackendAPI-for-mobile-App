'use strict';

/* Controllers */
// Tags controller
app.controller('TagsController', [
  '$scope',
  '$modal',
  'API',
  'NetminoUtils',
  function($scope,
           $modal,
           API,
           NetminoUtils) {

    //SCOPE METODS

    $scope.addNewTag = function() {
      var modalInstance = $modal.open({
        templateUrl: '../../../tpl/modals/new_tag_modal.html',
        controller: 'NewTagModalController',
        size: 'lg'
      });

      modalInstance.result.then(function(msg) {
        loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
      });
    };

    $scope.toggleTag = function(tag, isActive) {
      API.Tags.toggleTag(tag._id, {is_active: isActive}).success(function(res) {
        tag.is_active = !tag.is_active;
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

        API.Tags.getTags(query).success(function(data) {
          $scope.tags = data.tags;
          $scope.totalServerItems = data.total;
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
      data: 'tags',
      enablePaging: true,
      showFooter: true,
      totalServerItems: 'totalServerItems',
      pagingOptions: $scope.pagingOptions,
      filterOptions: $scope.filterOptions,
      enableRowSelection: false,
      columnDefs: [
        {field: 'name', displayName: 'Name'},
        {
          displayName: 'Action',
          sortable: false,
          cellClass: 'cellToolTip',
          cellTemplate: '/tpl/datagrids/page_tags_ct.html',
          width: 110
        }],
      rowHeight: 40
    };

    $scope.totalServerItems = 0;
    //INIT

    loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);

  }]);
