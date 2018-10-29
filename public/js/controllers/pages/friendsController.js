'use strict';

/* Controllers */
// Friends controller
app.controller('FriendsController', [
  '$scope',
  '$rootScope',
  'API',
  '_',
  'NetminoUtils',
  function($scope,
           $rootScope,
           API,
           _,
           NetminoUtils) {

    //PRIVATE STUFF

    var loadUsers = function(size, page, searchText) {
      var query = {
        size: size,
        page: page,
        filter: searchText,
        sort: 'name'
      };
      setTimeout(function() {

        API.Users.getUsers(query).success(function(data) {
          $scope.items = data;

          API.Users.getUserFriends($rootScope.user._id).success(function(data) {
            var friendships = data.friendships;
            _.each($scope.items.users, function(user) {
              var friend = _.findWhere(friendships, {_id: user._id});
              user.friendship = friend;
            });
          }).error(NetminoUtils.handleError);
        }).error(NetminoUtils.handleError);
      }, 500);
    };

    //SCOPE METHODS

    $scope.addFriend = function(userEntry) {
      API.Users.addUserAsFriend($rootScope.user._id, userEntry._id).success(function(data) {
        userEntry.friendship = data.friendships;
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
      data: 'items.users',
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
          cellTemplate: '/tpl/datagrids/page_friends_ct.html'
        }
      ],
      rowHeight: 130
    };

    $scope.unfriend = function(userEntry) {
      API.Users.removeFriend($rootScope.user._id, userEntry._id).success(function(data) {
        userEntry.friendship = data.friendships;
      }).error(NetminoUtils.handleError);
    };

    //WATCHERS

    $scope.$watch('filterOptions', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        loadUsers($scope.pagingOptions.pageSize,
          $scope.pagingOptions.currentPage,
          $scope.filterOptions.filterText);
      }
    }, true);

    $scope.$watch('pagingOptions', function(newVal, oldVal) {
      if (newVal.pageSize !== oldVal.pageSize || newVal.currentPage !== oldVal.currentPage) {
        loadUsers($scope.pagingOptions.pageSize,
          $scope.pagingOptions.currentPage,
          $scope.filterOptions.filterText);
      }
    }, true);

    //INIT
    loadUsers($scope.pagingOptions.pageSize, $scope.pagingOptions.currentPage);
  }]);
