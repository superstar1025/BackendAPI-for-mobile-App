'use strict';

/* Controllers */
// Business profile subscription controller
app.controller('BusinessProfileSubscriptionController', [
  '$scope',
  '$rootScope',
  '$state',
  'API',
  '_',
  'NetminoUtils',
  function($scope,
           $rootScope,
           $state,
           API,
           _,
           NetminoUtils) {

    //PRIVATE STUFF

    var businessFollowersCallback = function(data) {
      $scope.businessFollowers = data;
    };

    var getProfileDetails = function(id) {
      API.BusinessProfiles.getBusinessProfileById(id).success(function(data) {
        $scope.profile = data;
        if (data.location) {
          $scope.center.lat = data.location.lat;
          $scope.center.lng = data.location.lng;
          $scope.center.zoom = 15;
          $scope.markers = {
            profileMarker: {
              lat: $scope.center.lat,
              lng: $scope.center.lng
            }
          };
        }
      }).error(NetminoUtils.handleError);
    };

    var loadBusinessEvents = function(id, size, page, searchText) {
      var query = {
        size: size,
        page: page,
        filter: searchText,
        sort: '-date_created'
      };
      setTimeout(function() {
        API.BusinessProfiles.getBusinessProfileEvents(id, query).success(function(data) {
          if (searchText) {
            var ft = searchText.toLowerCase();
            data.events = data.events.filter(function(item) {
              return JSON.stringify(item).toLowerCase().indexOf(ft) != -1;
            });
          }
          $scope.businessEvents = data;
        }).error(NetminoUtils.handleError);
      }, 500);
    };

    var loadBusinessFollowers = function(id, size, page) {
      var query = {
        size: size,
        page: page,
        sort: '-date_followed'
      };

      if (!$rootScope.isSignedIn) {
        API.BusinessProfiles.getBusinessProfilePublicFollowers(id, query)
          .success(businessFollowersCallback).error(NetminoUtils.handleError);
      } else {
        API.BusinessProfiles.getBusinessProfileFollowers(id, query)
          .success(businessFollowersCallback).error(NetminoUtils.handleError);
      }
    };

    //SCOPE METHODS

    $scope.followBusinessProfile = function(id) {
      API.BusinessProfiles.followBusinessProfile(id, $rootScope.user._id).success(function(data) {
        $scope.isProfileFollowed = data.follower;
        $scope.businessFollowers.followers.unshift(data.follower);
        $scope.businessFollowers.total++;
      }).error(NetminoUtils.handleError);
    };

    $scope.pickEvent = function(event) {
      console.log('pick', event);
    };

    $scope.selectEvent = function(event) {
      $state.go('app.page.event_details', {id: event._id});
    };

    $scope.unfollowBusinessProfile = function(id) {
      API.BusinessProfiles.unfollowBusinessProfile(id, $rootScope.user._id).success(function(data) {
        $scope.isProfileFollowed = null;
        $scope.businessFollowers.followers = _.reject($scope.businessFollowers.followers, function(el) {
          return $rootScope.user._id === el.user._id;
        });
        $scope.businessFollowers.total--;
      }).error(NetminoUtils.handleError);
    };

    //WATCHERS

    $scope.$watch('profile._id', function(val) {
      if (val) {
        $scope.profileId = val;
        loadBusinessFollowers($scope.profileId,
          $scope.pagingOptions.followers.pageSize,
          $scope.pagingOptions.followers.currentPage,
          $scope.filterOptions.followers.filterText);
        loadBusinessEvents($scope.profileId,
          $scope.pagingOptions.events.pageSize,
          $scope.pagingOptions.events.currentPage,
          $scope.filterOptions.events.filterText);
      }
    });

    $scope.$watch('filterOptions.events', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        loadBusinessEvents($scope.profileId,
          $scope.pagingOptions.events.pageSize,
          $scope.pagingOptions.events.currentPage,
          $scope.filterOptions.events.filterText);
      }
    }, true);

    $scope.$watch('pagingOptions.events', function(newVal, oldVal) {
      if (newVal.pageSize !== oldVal.pageSize || newVal.currentPage !== oldVal.currentPage) {
        loadBusinessEvents($scope.profileId,
          $scope.pagingOptions.events.pageSize,
          $scope.pagingOptions.events.currentPage,
          $scope.filterOptions.events.filterText);
      }
    }, true);

    //INIT
    //leaflet map options
    angular.extend($scope, {
      center: {
        lat: 0,
        lng: 0,
        zoom: 0
      }
    });

    $scope.businessFollowers = {
      followers: [],
      total: 0
    };

    $scope.filterOptions = {
      events: {
        filterText: '',
        useExternalFilter: true
      },
      followers: {
        filterText: '',
        useExternalFilter: true
      }
    };

    $scope.pagingOptions = {
      events: {
        pageSizes: [10, 20, 30],
        pageSize: 10,
        currentPage: 1
      },
      followers: {
        pageSize: 10,
        currentPage: 1
      }
    };

    $scope.eventsGridOptions = {
      data: 'businessEvents.events',
      enablePaging: true,
      showFooter: true,
      totalServerItems: 'businessEvents.total',
      pagingOptions: $scope.pagingOptions.events,
      filterOptions: $scope.filterOptions.events,
      enableRowSelection: false,
      headerRowHeight: 0,
      columnDefs: [
        {
          displayName: 'Event',
          sortable: false,
          cellTemplate: '/tpl/datagrids/page_business_profile_subscription_events_ct.html'
        }
      ],
      rowHeight: 130,
      selectedItems: $scope.selectedRows
    };

    $scope.profileId = $state.params.id;
    getProfileDetails($scope.profileId);

    if ($rootScope.isSignedIn) {
      API.BusinessProfiles.isBusinessProfileFollowedByUser($scope.profileId, $rootScope.user._id)
        .success(function(data) {
          $scope.isProfileFollowed = data.follower;
        }).error(NetminoUtils.handleError);
    }
  }]);
