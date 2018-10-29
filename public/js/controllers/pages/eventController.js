'use strict';

/* Controllers */
// event controller
app.controller('EventFormController', [
  '$scope',
  '$state',
  '$location',
  '$rootScope',
  'growl',
  'blockUI',
  'geolocation',
  'Delay',
  'Geosearch',
  'FileUploader',
  'API',
  'EventHelper',
  '_',
  'NetminoUtils',
  function($scope,
           $state,
           $location,
           $rootScope,
           growl,
           blockUI,
           geolocation,
           Delay,
           Geosearch,
           FileUploader,
           API,
           EventHelper,
           _,
           NetminoUtils) {

    // PRIVATE STUFF

    var prevState = {
      name: 'app.page.events'
    };
    var prevParams = null;

    var prevBusinessProvider = null;

    var initBusinessOptions = function(event) {
      if (!$rootScope.isBusinessProvider) {
        API.Users.getUsers({role: 'business_provider'}).success(function(data) {
          $scope.businessProviders = data.users;
          $scope.businessProviderSelected(event, event.businessProvider);
        }).error(NetminoUtils.handleError);
      } else {
        $scope.businessProviders = [$rootScope.user];
        event.businessProvider = $rootScope.user;
        $scope.businessProviderSelected(event, $rootScope.user);
      }
    };

    var initEmptyEvent = function() {
      $scope.event = {
        is_public: true,
        description: '',
        comments_allowed: false,
        location: {
          display_name: '',
          lat: 0,
          lng: 0
        },
        hubs: [],
        tags: []
      };
      $scope.initEventDateTime();
      geolocation.getLocation().then(function(data) {
        if (data) {
          $scope.center.lat = data.coords.latitude;
          $scope.center.lng = data.coords.longitude;
          $scope.center.zoom = 15;
          $scope.markers = {
            eventMarker: {
              lat: $scope.center.lat,
              lng: $scope.center.lng
            }
          };
        } else {
          console.error('Could not get location.');
        }
      });
      initBusinessOptions($scope.event);
    };

    var initEvent = function(id) {
      $scope.event = {
        hubs: [],
        tags: []
      };

      API.Events.getEventById(id).success(function(data) {
        $scope.event = data.event;
        $scope.event.businessProvider = data.business_provider;
        prevBusinessProvider = data.business_provider;
        $scope.initEventDateTime($scope.event.start_datetime, $scope.event.end_datetime,
          $scope.event.start_datetime, $scope.event.end_datetime);
        $scope.geoSearchTxt = $scope.event.location.display_name;
        $scope.center.lat = $scope.event.location.lat;
        $scope.center.lng = $scope.event.location.lng;
        $scope.center.zoom = 15;
        $scope.markers = {
          eventMarker: {
            lat: $scope.event.location.lat,
            lng: $scope.event.location.lng
          }
        };
        initBusinessOptions($scope.event);
      }).error(NetminoUtils.handleError);
    };

    // SCOPE METHODS

    $scope.businessProviderSelected = function(event, user) {
      if (!prevBusinessProvider || prevBusinessProvider._id !== user._id) {
        event.business = null;
      }

      if (user) {
        prevBusinessProvider = user;
        API.BusinessProfiles.getBusinessProfilesByUserId(user._id).success(function(data) {
          $scope.businessProfiles = data.profiles;
        }).error(NetminoUtils.handleError);
      }
    };

    $scope.cancelEvent = function() {
      $state.go(prevState.name, {id: prevParams.id});
    };

    $scope.geoSearch = function(geoSearchTxt) {
      $scope.locationNotFound = false;
      // Avoid flooding the geosearch XHR call.
      Delay.execute(function() {
        Geosearch.search(geoSearchTxt, function(loc) {
          $scope.center = loc;
          if (!$scope.markers) {
            $scope.markers = {};
          }
          $scope.markers.eventMarker = loc;
          $scope.center.zoom = 15;
        }, function() {
          $scope.locationNotFound = true;
        });
      }, 500);
    };

    $scope.tagTransform = function(newTag) {
      return {
        _id: null,
        name: newTag
      }
    };

    $scope.open = function($event, which) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.datepickers.from = false;
      $scope.datepickers.to = false;
      $scope.datepickers[which] = true;
    };

    $scope.itemSelected = function(item, arr) {
      if (!item._id) {
        return API.Tags.addNewTag({name: item.name}).success(function(data) {
          item._id = data.tag._id;
        }).error(NetminoUtils.handleError);
      }
    };

    $scope.initEventDateTime = function(startDatetime, endDatetime, startTime, endTime) {
      $scope.event.start_datetime = startDatetime ? new Date(startDatetime) : new Date();
      $scope.event.end_datetime = endDatetime ? new Date(endDatetime) : new Date();
      $scope.event.start_time = startTime ? new Date(startTime) : new Date();
      $scope.event.end_time = endTime ? new Date(endTime) : new Date();
    };

    $scope.updateEvent = function(event, isDraft) {
      $scope.is_draft = isDraft;
      blockablePublishEventUI.start();
      if ($scope.uploader.queue.length === 0) {
        event = EventHelper.prepareEventObj(event, $scope.markers, isDraft);

        if (event._id) {
          return API.Events.updateEvent(event).success(function(data) {
            blockablePublishEventUI.stop();
            $scope.cancelEvent();
          }).error(NetminoUtils.handleError);
        } else {
          return API.Events.addNewEvent(event).success(function(data) {
            growl.addInfoMessage(data.message);
            event = EventHelper.resetEvent(event);
            if (!$rootScope.isBusinessProvider) {
              $scope.businessProfiles = null;
            }
            blockablePublishEventUI.stop();
          }).error(NetminoUtils.handleError);
        }
      } else {
        //upload image
        $scope.uploader.uploadAll();
      }
    };

    // OPTIONS

    //leaflet map options
    angular.extend($scope, {
      center: {
        lat: 0,
        lng: 0,
        zoom: 0
      },
      events: {
        map: {
          enable: ['click'],
          logic: 'emit'
        }
      }
    });

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 1,
      class: 'datepicker',
      showWeeks: false
    };
    $scope.timeOptions = {
      hstep: 1,
      mstep: 10
    };

    $scope.datepickers = {
      from: false,
      to: false
    };

    $scope.format = 'dd-MMMM-yyyy';
    $scope.minDate = new Date();
    $scope.uploader = new FileUploader({
      url: '/api/v1/attachments/image',
      onAfterAddingFile: function() {
        $scope.fileError = false;
      },
      onErrorItem: function() {
        $scope.fileError = true;
        blockablePublishEventUI.stop();
      },
      onSuccessItem: function(item, res) {
        $scope.event.image = res.data;
        $scope.fileError = false;
        $scope.uploader.clearQueue();
        $scope.updateEvent($scope.event, $scope.is_draft);
      },
      onWhenAddingFileFailed: function() {
        $scope.fileError = true;
      },
      onCompleteItem: function() {
        blockablePublishEventUI.stop();
      }
    });

    $scope.uploader.filters.push({
      name: 'imageFilter',
      fn: function(item) {
        var type = '|' + item.type.slice(item.type.lastIndexOf('/') + 1) + '|';
        return '|jpg|png|jpeg|bmp|gif|'.indexOf(type) !== -1;
      }
    });
    $scope.uploader.filters.push({
      name: 'overWriteFilter',
      fn: function() {
        if (this.queue.length === 1) {
          this.clearQueue();
        }
        return true;
      }
    });

    //EVENTS

    $scope.$on('leafletDirectiveMap.click', function(event, args) {
      var leafEvent = args.leafletEvent;

      if ($scope.markers) {
        $scope.markers.eventMarker.lat = leafEvent.latlng.lat;
        $scope.markers.eventMarker.lng = leafEvent.latlng.lng;
      }
    });

    $scope.$on('$stateChangeSuccess', function(ev, to, toParams, from, fromParams) {
      if (from.name !== '') {
        prevState = from;
        prevParams = fromParams;
      }
    });

    //INIT

    if (!$state.params.id || $state.params.id === 'new') {
      initEmptyEvent();
      $scope.isNewEvent = true;
    } else {
      initEvent($state.params.id);
      $scope.isNewEvent = false;
    }

    $scope.fileUploadError = false;

    API.Hubs.getHubs().success(function(data) {
      $scope.hubs = _.map(data.hubs, function(item) {
        return item.hub;
      });
    }).error(NetminoUtils.handleError);

    API.EventTypes.getEventTypes().success(function(data) {
      $scope.types = data.types;
    }).error(NetminoUtils.handleError);

    API.Tags.getTags().success(function(data) {
      $scope.tags = data.tags;
    }).error(NetminoUtils.handleError);

    var blockablePublishEventUI = blockUI.instances.get('blockablePublishEventUI');

  }]);
