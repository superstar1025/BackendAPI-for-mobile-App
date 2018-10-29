'use strict';

/* Controllers */
// Business profile controller
app.controller('BusinessProfileFormController', [
  '$scope',
  '$state',
  'API',
  'growl',
  'Delay',
  'Geosearch',
  'FileUploader',
  'blockUI',
  'NetminoUtils',
  function($scope,
           $state,
           API,
           growl,
           Delay,
           Geosearch,
           FileUploader,
           blockUI,
           NetminoUtils) {

    // PRIVATE STUFF

    var prevState = {
      name: 'app.page.events'
    };

    var initBusinessProfile = function(profileId) {
      $scope.businessProfiles = [];

      API.BusinessCategories.getPrimaryBusinessCategories().success(function(data, status, headers, config) {
        $scope.primaryBusinessCategories = data;
      }).error(NetminoUtils.handleError);

      //user observes all his business profiles
      if (profileId === 'my' || !$scope.adminProfileEditMode) {
        API.BusinessProfiles.getBusinessProfilesByUserId($scope.userId).success(function(data) {
          $scope.businessProfiles = data.profiles;
          if (!$scope.profileModel._id && $scope.businessProfiles.length > 0) {
            $scope.profileModel = angular.copy($scope.businessProfiles[0]);
          }
          $scope.selectedProfile = angular.copy($scope.profileModel);
        }).error(NetminoUtils.handleError);
      }

      //admin creates/updates a user's business profile
      if (profileId && profileId !== 'my' && $scope.adminProfileEditMode) {
        API.BusinessProfiles.getBusinessProfileById(profileId).success(function(data) {
          $scope.profileModel = data;
          $scope.businessProfiles.push(data);
        }).error(NetminoUtils.handleError);
      }
    };

    var imagesFilter = {
      name: 'imageFilter',
      fn: function(item) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    };

    var oneFileOnlyFilter = {
      name: 'overWriteFilter',
      fn: function() {
        if (this.queue.length == 1) {
          this.clearQueue();
        }
        return true;
      }
    };

    var businessProfileSuccessCallback = function(data) {
      blockableBusinessProfileUI.stop();
      if (data.error) {
        growl.addErrorMessage(data.error.message);
      } else {
        $scope.cancelProfile();
      }
    };

    var loadBusinessEvents = function(id, size, page, searchText) {
      var query = {
        size: size,
        page: page,
        filter: searchText
      };
      setTimeout(function() {
        API.BusinessProfiles.getBusinessProfileEvents(id, query).success(function(data) {
          $scope.businessEvents = data;
        }).error(NetminoUtils.handleError);
      }, 500);
    };

    var loadBusinessFollowers = function(id, size, page, searchText) {
      var query = {
        size: size,
        page: page,
        filter: searchText
      };
      setTimeout(function() {
        API.BusinessProfiles.getBusinessProfileFollowers(id, query).success(function(data) {
          $scope.businessFollowers = data;
        }).error(NetminoUtils.handleError);
      }, 500);
    };

    // SCOPE METHODS

    $scope.cancelProfile = function() {
      $state.go(prevState.name);
    };

    $scope.geoSearch = function(geoSearchTxt, form) {
      $scope.locationNotFound = false;
      // Avoid flooding the geosearch XHR call.
      Delay.execute(function() {
        Geosearch.search(geoSearchTxt, function(loc) {
          $scope.profileModel.location = loc;
          form.$invalid = false;
        }, function() {
          if (geoSearchTxt) {
            form.$invalid = true;
          }
          $scope.profileModel.location = {};
          $scope.locationNotFound = true;
        });
      }, 1000);
    };

    $scope.logoUploader = new FileUploader({
      url: '/api/v1/attachments/image',
      onAfterAddingFile: function() {
        $scope.logoFileError = false;
      },
      onErrorItem: function() {
        $scope.logoFileError = true;
      },
      onSuccessItem: function(item, res) {
        $scope.profileModel.logo = res.data;
        $scope.logoFileError = false;
        $scope.logoUploader.clearQueue();
        $scope.updateProfile($scope.profileModel);
      },
      onWhenAddingFileFailed: function() {
        $scope.logoFileError = true;
      },
      onCompleteItem: function() {
        blockableBusinessProfileUI.stop();
      }
    });

    $scope.logoUploader.filters.push(imagesFilter, oneFileOnlyFilter);

    $scope.coverUploader = new FileUploader({
      url: '/api/v1/attachments/image',
      onAfterAddingFile: function() {
        $scope.coverFileError = false;
      },
      onErrorItem: function() {
        $scope.coverFileError = true;
      },
      onSuccessItem: function(item, res) {
        $scope.profileModel.cover_image = res.data;
        $scope.coverFileError = false;
        $scope.coverUploader.clearQueue();
        $scope.updateProfile($scope.profileModel);
      },
      onWhenAddingFileFailed: function() {
        $scope.coverFileError = true;
      },
      onCompleteItem: function() {
        blockableBusinessProfileUI.stop();
      }
    });

    $scope.coverUploader.filters.push(imagesFilter, oneFileOnlyFilter);

    $scope.createProfile = function(profileModel) {

      if (profileModel.date_created) {
        delete profileModel.date_created;
      }

      if (profileModel._id) {
        delete profileModel._id;
      }
      $scope.updateProfile(profileModel);
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
        pageSizes: [10, 20, 30],
        pageSize: 10,
        currentPage: 1
      }
    };

    $scope.selectProfile = function(id) {
      API.BusinessProfiles.getBusinessProfileById(id).success(function(data) {
        $scope.profileModel = angular.copy(data);
      }).error(NetminoUtils.handleError)
    };

    $scope.toggleFollower = function(item) {
      if (item.toUnfollow) {
        API.BusinessProfiles.unfollowBusinessProfile(item.business._id, item.user._id).success(function(data) {
          growl.addInfoMessage(data.message);
        }).error(NetminoUtils.handleError);
      } else {
        API.BusinessProfiles.followBusinessProfile(item.business._id, item.user._id).success(function(data) {
          growl.addInfoMessage(data.message);
        }).error(NetminoUtils.handleError);
      }
    };

    $scope.updateProfile = function(profileModel) {

      blockableBusinessProfileUI.start();

      if (profileModel.date_modified) {
        delete profileModel.date_modified;
      }

      if ($scope.logoUploader.queue.length === 0 && $scope.coverUploader.queue.length === 0) {

        if ($scope.adminProfileEditMode) {
          profileModel.created_by = $scope.userId;
        }

        if (profileModel._id) {
          return API.BusinessProfiles.updateBusinessProfile(profileModel)
            .success(businessProfileSuccessCallback).error(NetminoUtils.handleError);
        } else {
          return API.BusinessProfiles.createBusinessProfile(profileModel)
            .success(businessProfileSuccessCallback).error(NetminoUtils.handleError);
        }
      }

      if ($scope.logoUploader.queue.length === 0) {
        return $scope.coverUploader.uploadAll();
      }

      if ($scope.coverUploader.queue.length === 0) {
        return $scope.logoUploader.uploadAll();
      }

      $scope.logoUploader.uploadAll();
    };

    //EVENTS
    $scope.$on('$stateChangeSuccess', function(ev, to, toParams, from) {
      if (from.name !== '') {
        prevState = from;
      }
    });

    //WATCHERS
    $scope.$watch('profileModel.primary_category', function(val) {
      if (val) {
        if ($scope.profileModel.secondary_category &&
          $scope.profileModel.secondary_category.parent_category !== $scope.profileModel.primary_category._id) {
          $scope.profileModel.secondary_category = null;
          $scope.profileModel.tertiary_category = null;
        }
        API.BusinessCategories.getBusinessCategoriesByParentId(val._id).success(function(data) {
          $scope.secondaryBusinessCategories = data;
        }).error(NetminoUtils.handleError);
      }
    });

    $scope.$watch('profileModel.secondary_category', function(val) {
      if (val) {
        if ($scope.profileModel.tertiary_category &&
          $scope.profileModel.tertiary_category.parent_category !== $scope.profileModel.secondary_category._id) {
          $scope.profileModel.tertiary_category = null;
        }
        API.BusinessCategories.getBusinessCategoriesByParentId(val._id).success(function(data) {
          $scope.tertiaryBusinessCategories = data;
        }).error(NetminoUtils.handleError);
      }
    });

    $scope.$watch('profileModel._id', function(val) {
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

    $scope.$watch('filterOptions.followers', function(newVal, oldVal) {
      if (newVal !== oldVal) {
        loadBusinessFollowers($scope.profileId,
          $scope.pagingOptions.followers.pageSize,
          $scope.pagingOptions.followers.currentPage,
          $scope.filterOptions.followers.filterText);
      }
    }, true);

    $scope.$watch('pagingOptions.followers', function(newVal, oldVal) {
      if (newVal.pageSize !== oldVal.pageSize || newVal.currentPage !== oldVal.currentPage) {
        loadBusinessFollowers($scope.profileId,
          $scope.pagingOptions.followers.pageSize,
          $scope.pagingOptions.followers.currentPage,
          $scope.filterOptions.followers.filterText);
      }
    }, true);

    // INIT

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
          cellTemplate: '/tpl/datagrids/page_business_profile_events_ct.html'
        }
      ],
      rowHeight: 70
    };

    $scope.followersGridOptions = {
      data: 'businessFollowers.followers',
      enablePaging: true,
      showFooter: true,
      totalServerItems: 'businessFollowers.total',
      pagingOptions: $scope.pagingOptions.followers,
      filterOptions: $scope.filterOptions.followers,
      enableRowSelection: false,
      columnDefs: [
        {field: 'user.name', displayName: 'Name'},
        {field: 'date_followed', displayName: 'Date followed', cellFilter: 'date: "dd-MMM-yyyy"'},
        {
          displayName: 'Unfollow',
          sortable: false,
          cellTemplate: '/tpl/datagrids/page_business_profile_followers_ct.html'
        }
      ]
    };

    $scope.isCreateEnabled = true;
    $scope.isUpdateEnabled = true;

    $scope.userId = $state.params.userId;
    $scope.profileId = $state.params.profileId;

    $scope.profileModel = {
      logo: null,
      cover_image: null,
      location: {}
    };
    var blockableBusinessProfileUI = blockUI.instances.get('blockableBusinessProfileUI');

    if ($scope.profileId !== 'my') {
      $scope.adminProfileEditMode = true;
    }

    if ($scope.adminProfileEditMode && $scope.profileId) {
      $scope.isCreateEnabled = false;
    }

    if ($scope.adminProfileEditMode && !$scope.profileId) {
      $scope.isUpdateEnabled = false;
    }

    initBusinessProfile($scope.profileId);

  }]);
