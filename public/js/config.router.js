'use strict';

/**
 * Config for the router
 */
app.run(
  ['$rootScope', '$state', '$stateParams', '$auth',
    function($rootScope, $state, $stateParams, $auth) {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
      $rootScope.$on('$stateChangeStart', function(ev, toState, toParams) {
        if (!$auth.isAuthenticated() && !(toState.data && toState.data.isPublic)) {
          ev.preventDefault();
          $rootScope.$broadcast('$stateChangeRejectedUnauthenticated');
        }
      });
    }
  ]
)
  .config(
  ['$stateProvider', '$urlRouterProvider', '$windowProvider',
    function($stateProvider, $urlRouterProvider, $windowProvider) {
      var $window = $windowProvider.$get();
      $urlRouterProvider
        .otherwise(function() {
          var defaultUrl = '/app/landing';
          if ($window.user.role && ($window.user.role.name === 'super_user' ||
            $window.user.role.name === 'application_administrator')) {
            defaultUrl = '/app/admin-dashboard';
          } else if ($window.user.role && ($window.user.role.name === 'business_provider')) {
            defaultUrl = '/app/business-provider-dashboard';
          }
          return defaultUrl;
        });
      $stateProvider
        .state('app', {
          abstract: true,
          url: '/app',
          templateUrl: 'tpl/app.html'
        })
          .state('app.landing', {
            url: '/landing',
            templateUrl: 'tpl/pages/page_landing.html',
            resolve: {
              deps: ['uiLoad',
                function(uiLoad) {
                  return uiLoad.load([
                    'js/components/moment/min/moment.min.js'
                  ]);
                }]
            },
            controller: 'LandingController',
            data: {isPublic: true}
          })
        .state('app.admin-dashboard', {
          url: '/admin-dashboard',
          templateUrl: 'tpl/pages/page_dashboard_admin.html',
          resolve: {
            deps: ['uiLoad',
              function(uiLoad) {
                return uiLoad.load([
                  'js/components/moment/min/moment.min.js'
                ]);
              }]
          },
          controller: 'AdminDashboardController'
        })
        .state('app.business-provider-dashboard', {
          url: '/business-provider-dashboard',
          templateUrl: 'tpl/pages/page_dashboard_business_provider.html',
          controller: 'BusinessDashboardController'
        })
        // pages
        .state('app.page', {
          url: '/page',
          template: '<div ui-view class="fade-in-down"></div>'
        })
        .state('app.page.profile', {
          url: '/profile/:id',
          templateUrl: 'tpl/pages/page_profile.html',
          controller: 'ProfileFormController'
        })
        .state('app.page.business_profile', {
          url: '/user/:userId/business_profile/:profileId',
          templateUrl: 'tpl/pages/page_business_profile.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['ui.select', 'angularFileUpload', 'ngGrid']);
              }]
          },
          controller: 'BusinessProfileFormController'
        })
        .state('app.page.business_profile_subscription', {
          url: '/business_profile/:id',
          templateUrl: 'tpl/pages/page_business_profile_subscription.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['ngGrid']);
              }]
          },
          controller: 'BusinessProfileSubscriptionController'
        })
        .state('app.page.event', {
          url: '/events/:id',
          templateUrl: 'tpl/pages/page_edit_event.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['ui.select', 'angularFileUpload']);
              }]
          },
          controller: 'EventFormController'
        })

        .state('app.page.event_details', {
          url: '/events/details/:id',
          templateUrl: 'tpl/pages/page_event_details.html',
          controller: 'EventDetailsController'

        })

        .state('app.page.events', {
          url: '/events',
          templateUrl: 'tpl/pages/page_events.html',
          controller: 'EventsController',
          data: {isPublic: true}
        })

        .state('app.page.users', {
          url: '/users',
          templateUrl: 'tpl/pages/page_users.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['xeditable', 'ngGrid']);
              }]
          },
          controller: 'UsersController'
        })
        .state('app.page.roles', {
          url: '/roles',
          templateUrl: 'tpl/pages/page_roles.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['ngGrid']);
              }]
          },

          controller: 'RolesController'
        })

        .state('app.page.hubs', {
          url: '/hubs',
          templateUrl: 'tpl/pages/page_hubs.html',
          controller: 'HubsController'
        })

          .state('app.page.playlist', {
            url: '/playlist',
            templateUrl: 'tpl/pages/page_playlist.html',
            controller: 'PlaylistController'
          })

        .state('app.page.adminHubs', {
          url: '/admin/hubs',
          templateUrl: 'tpl/pages/page_admin_hubs.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['ngGrid']);
              }]
          },
          controller: 'HubsAdminController'
        })

        .state('app.page.hubDetails', {
          url: '/hubs/:id',
          templateUrl: 'tpl/pages/page_hub_details.html',
          controller: 'HubDetailsController'
        })

        .state('app.page.tags', {
          url: '/tags',
          templateUrl: 'tpl/pages/page_tags.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['ngGrid']);
              }]
          },
          controller: 'TagsController'
        })
        .state('app.page.business_profiles', {
          url: '/business_profiles',
          templateUrl: 'tpl/pages/page_business_profiles.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['ngGrid']);
              }]
          },
          controller: 'BusinessProfilesController'
        })
        .state('app.page.locations', {
          url: '/locations',
          templateUrl: 'tpl/pages/page_locations.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['ngGrid']);
              }]
          },
          controller: 'LocationsController'
        })
        .state('app.page.subscriptions', {
          url: '/subscriptions',
          templateUrl: 'tpl/pages/page_subscriptions.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['ngGrid']);
              }]
          },
          controller: 'SubscriptionsController'
        })
        .state('app.page.friends', {
          url: '/friends',
          templateUrl: 'tpl/pages/page_friends.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['ngGrid']);
              }]
          },
          controller: 'FriendsController'
        })
        .state('app.page.recommendations', {
          url: '/recommendations',
          templateUrl: 'tpl/pages/page_recommendations.html',
          resolve: {
            deps: ['$ocLazyLoad',
              function($ocLazyLoad) {
                return $ocLazyLoad.load(['ngGrid']);
              }]
          },
          controller: 'RecommendationsController'
        })
        .state('app.page.player', {
          url: '/player',
          templateUrl: 'tpl/pages/page_player.html',
          controller: 'PlayerController'
        })
        .state('access', {
          url: '/access',
          template: '<div ui-view class="fade-in-right-big smooth"></div>'
        })
        .state('access.signin', {
          url: '/signin',
          templateUrl: 'tpl/pages/page_signin.html',
          controller: 'SigninFormController',
          data: {isPublic: true}
        })
        .state('access.signup', {
          url: '/signup',
          templateUrl: 'tpl/pages/page_signup.html',
          controller: 'SignupFormController',
          data: {isPublic: true}
        })
    }
  ]
);
