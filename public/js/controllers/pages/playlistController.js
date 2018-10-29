'use strict';

/* Controllers */
// Hubs controller (admin mode)
app.controller('PlaylistController', [
  '$scope',
  '$rootScope',
  '$modal',
  '$state',
  'growl',
  'API',
  'NetminoUtils',
  function($scope,
           $rootScope,
           $modal,
           $state,
           growl,
           API,
           NetminoUtils) {

    //PRIVATE STUFF
    var getAllTracks = function() {
      API.Tracks.getTracks().success(function(data) {
        $scope.allTracks = data.tracks;
      }).error(NetminoUtils.handleError);
    };

    var updateTracksList = function(newVal, oldVal) {
      if (newVal !== oldVal) {
        getAllTracks();
      }
    };

    var loadGridData = function(pageSize, page, searchText) {
      var query = {
        size: pageSize,
        page: page,
        filter: searchText
      };
      setTimeout(function() {
        API.Tracks.getTracks(query).success(function(data) {
          $scope.allTracks = data.tracks;
          $scope.totalServerItems = data.tracks.length;
        }).error(NetminoUtils.handleError);

      }, 500);
    };

    //SCOPE METHODS
    $scope.goToTrackDetalis = function(id) {
      $state.go('app.page.trackDetails', {id: id});
    };

    $scope.$watch('pagingOptions', function(newVal, oldVal) {
      if (newVal.pageSize !== oldVal.pageSize || newVal.currentPage !== oldVal.currentPage) {
        loadGridData($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage, $scope.filterOptions.filterText);
      }
    }, true);

    $scope.pagingOptions = {
      pageSizes: [10, 20, 30],
      pageSize: 10,
      currentPage: 1
    };

    $scope.gridOptions = {
      data: 'allTracks',
      enablePaging: true,
      showFooter: true,
      totalServerItems: 'totalServerItems',
      pagingOptions: $scope.pagingOptions,
      filterOptions: $scope.filterOptions,
      enableRowSelection: false,
      columnDefs: [
        {field: 'filename', displayName: 'Filename'},
        {
          displayName: 'Device',
          sortable: false,
          cellClass: 'cellToolTip',
          cellTemplate: '/tpl/datagrids/page_track_device.html',
          width: 210
        },

        {field: 'date_created', displayName: 'Date created', cellFilter: 'date: "dd-MMM-yyyy"', width: 110},
        {field: 'is_active', displayName: 'Status', cellFilter: 'toStatusStr', width: 110},
        {
          displayName: 'Actions',
          sortable: false,
          cellClass: 'cellToolTip',
          cellTemplate: '/tpl/datagrids/gen_actions_ct.html',
          width: 110
        }],
      rowHeight: 40
    };

    //WATCHERS

    //INIT
    loadGridData();
  }]);
