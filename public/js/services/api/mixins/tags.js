'use strict';

api.factory('TagsAPI', [
  '$http',
  function($http) {

    var methods = {
      /**
       * Get full list of all tags
       *
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       *
       * @return {Object}                                 Promise object
       */
      getTags: function(params) {
        // no parameters are passed
        if (arguments.length === 0) {
          params = {};
        }

        var options = {
          method: 'GET',
          url: '/api/tags',
          params: params
        };

        return $http(options);
      },
      /**
       * Activate/deactivate tag
       *
       * @param  [{String}]           id                  Tag id
       * @param  [{Object}]           params              Parameters
       * @param  [{Boolean}]          params.is_active    Tag active state to set
       *
       * @return {Object}                                 Promise object
       */
      toggleTag: function(id, params) {
        var options = {
          method: 'PUT',
          url: '/api/tags/' + id + '/toggle',
          data: params
        };
        return $http(options);
      },
      /**
       * Create new tags
       *
       * @param  [{Object}]           params                  Parameters object
       * @param  [{String}]           params.name             Tag name
       *
       * @return {Object}                                     Promise object
       */
      addNewTag: function(params) {
        var options = {
          method: 'POST',
          url: '/api/tags',
          data: params
        };
        return $http(options);
      }

    };

    return methods;
  }
]);
