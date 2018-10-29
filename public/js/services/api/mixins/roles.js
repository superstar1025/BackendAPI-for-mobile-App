'use strict';

api.factory('RolesAPI', [
  '$http',
  function($http) {

    var methods = {
      /**
       * Get full list of all Roles
       *
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       *
       * @return {Object}                                 Promise object
       */
      getRoles: function(params) {
        // no parameters are passed
        if (arguments.length === 0) {
          params = {};
        }

        var options = {
          method: 'GET',
          url: '/api/roles',
          params: params
        };

        return $http(options);
      },
      /**
       * Activate/deactivate role
       *
       * @param  [{String}]           id                  Role id
       * @param  [{Object}]           params              Parameters
       * @param  [{Boolean}]          params.is_active    Role active state to set
       *
       * @return {Object}                                 Promise object
       */
      toggleRole: function(id, params) {
        var options = {
          method: 'PUT',
          url: '/api/roles/' + id + '/toggle',
          data: params
        };
        return $http(options);
      },

      /**
       * Create new role
       *
       * @param  [{Object}]           params                  Parameters object
       * @param  [{String}]           params.name             User name
       *
       * @return {Object}                                     Promise object
       */
      addNewRole: function(params) {
        var options = {
          method: 'POST',
          url: '/api/roles',
          data: params
        };
        return $http(options);
      }

    };

    return methods;
  }
]);
