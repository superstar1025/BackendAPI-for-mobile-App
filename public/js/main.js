'use strict';

/* Controllers */

app.controller('AppCtrl', [
  '$scope',
  '$translate',
  '$localStorage',
  '$window',
  '$rootScope',
  '$http',
  '$state',
  '$modal',
  'API',
  '$auth',
  function($scope,
           $translate,
           $localStorage,
           $window,
           $rootScope,
           $http,
           $state,
           $modal,
           API,
           $auth) {
    // add 'ie' classes to html
    var isIE = !!navigator.userAgent.match(/MSIE/i);
    isIE && angular.element($window.document.body).addClass('ie');
    isSmartDevice($window) && angular.element($window.document.body).addClass('smart');

    // config
    $scope.app = {
      name: 'Netmino',
      version: '1.3.3',
      // for chart colors
      color: {
        primary: '#7266ba',
        info: '#23b7e5',
        success: '#27c24c',
        warning: '#fad733',
        danger: '#f05050',
        light: '#e8eff0',
        dark: '#3a3f51',
        grey: '#b7babb',
        black: '#1c2b36'
      },
      settings: {
        themeID: 6,
        navbarHeaderColor: 'bg-white-only',
        navbarCollapseColor: 'bg-white-only',
        asideColor: 'bg-grey',
        headerFixed: true,
        asideFixed: false,
        asideFolded: false,
        asideDock: false,
        container: false
      }
    };

    // save settings to local storage
    if (angular.isDefined($localStorage.settings)) {
      $scope.app.settings = $localStorage.settings;
    } else {
      $localStorage.settings = $scope.app.settings;
    }
    $scope.$watch('app.settings', function() {
      if ($scope.app.settings.asideDock && $scope.app.settings.asideFixed) {
        // aside dock and fixed must set the header fixed.
        $scope.app.settings.headerFixed = true;
      }
      // save to local storage
      $localStorage.settings = $scope.app.settings;
    }, true);

    // angular translate
    $scope.lang = {isopen: false};
    $scope.langs = {en: 'English', de_DE: 'German', it_IT: 'Italian'};
    $scope.selectLang = $scope.langs[$translate.proposedLanguage()] || 'English';
    $scope.setLang = function(langKey, $event) {
      // set the current lang
      $scope.selectLang = $scope.langs[langKey];
      // You can change the language during runtime
      $translate.use(langKey);
      $scope.lang.isopen = !$scope.lang.isopen;
    };

    function isSmartDevice($window) {
      // Adapted from http://www.detectmobilebrowsers.com
      var ua = $window['navigator']['userAgent'] || $window['navigator']['vendor'] || $window['opera'];
      // Checks for iOs, Android, Blackberry, Opera Mini, and Windows mobile devices
      return (/iPhone|iPod|iPad|Silk|Android|BlackBerry|Opera Mini|IEMobile/).test(ua);
    }

    //********************** CUSTOM CODE **********************

    //SCOPE METHODS

    $scope.logOut = function() {
      $auth.logout();
      $rootScope.$broadcast('user is authenticated', null);
    };

    $scope.openEventEditPage = function() {
      $state.go('app.page.event', {id: 'new'});
    };

    $scope.renderSignUp = function() {
      $state.go('access.signup');
    };

    $scope.goToDashboard = function() {
      if ($rootScope.isAdmin) {
        $state.go('app.admin-dashboard');
      } else {
        $state.go('app.business-provider-dashboard');
      }
    };

    //PRIVATE METHODS

    var onAuth = function(token) {
      if (!token) {
        $rootScope.user = 'anonymous';
        $rootScope.isSignedIn = false;
        $scope.app.hideAside = true;
        return;
      }
      API.Auth.me().success(function(user) {
        $rootScope.user = user;
        $rootScope.isSignedIn = true;
        $scope.app.hideAside = false;
        $rootScope.isAdmin = $rootScope.user.role.name === 'application_administrator' ||
                             $rootScope.user.role.name === 'super_user';
        $rootScope.isBusinessProvider = $rootScope.user.role.name === 'business_provider';
        if (!$rootScope.user.is_active || !$rootScope.user.role.is_active) {
          $modal.open({
            templateUrl: '../../tpl/modals/account_deactivated_modal.html',
            controller: 'userDeactivatedModalController',
            keyboard: false,
            backdrop: 'static',
            windowClass: 'error-modal'
          });
        }
      }).error(function() {
        $auth.logout();
        $rootScope.user = 'anonymous';
        $rootScope.isSignedIn = false;
        $scope.app.hideAside = true;
      });
    };

    //EVENTS

    $scope.$on('user is authenticated', onAuth);

    // CONTROLLER LOGIC

    onAuth($auth.getToken());

  }]);
