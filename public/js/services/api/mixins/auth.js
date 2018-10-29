'use strict';

api.factory('AuthAPI', [
  '$http',
  function($http) {

    var methods = {

      /**
       * GET current user
       *
       * @return {Object}                                 Promise object
       */
      me: function(params) {
        var options = {
          method: 'GET',
          url: '/api/me'
        };

        return $http(options);
      },

      /**
       * User sign up
       *
       * @param  [{Object}]           params                      Parameters object
       * @param  [{String}]           params.name                 User name
       * @param  [{String}]           params.email                User email
       * @param  [{String}]           params.password             User password
       * @param  [{String}]           params.confirmPassword      User password confirmation
       *
       * @return {Object}                                 Promise object
       */
      signup: function(params) {
        var options = {
          method: 'POST',
          url: '/api/signup',
          data: params
        };

        return $http(options);
      }
    };

    return methods;
  }
]);
