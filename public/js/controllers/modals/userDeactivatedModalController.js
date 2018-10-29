'use strict';

/* Controllers */
// account/role is deactivated modal
app.controller('userDeactivatedModalController', [
  '$scope',
  '$rootScope',
  '$state',
  '$modalInstance',
  'API',
  'NetminoUtils',
  function($scope,
           $rootScope,
           $state,
           $modalInstance,
           API,
           NetminoUtils) {

    API.Auth.logout().success(function(res) {
      $rootScope.$broadcast('user is authenticated', null);
    }).error(NetminoUtils.handleError);

    $scope.logOut = function() {
      $modalInstance.dismiss('cancel');
      $state.go('app.page.events');
    };
  }]);
