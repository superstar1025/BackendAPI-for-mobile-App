'use strict';

api.factory('EventTypesAPI', [
  '$http',
  function($http) {

    var methods = {
      /**
       * Get full list of all event types
       *
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       *
       * @return {Object}                                 Promise object
       */
      getEventTypes: function(params) {
        // no parameters are passed
        if (arguments.length === 0) {
          params = {};
        }

        var options = {
          method: 'GET',
          url: '/api/event-types',
          params: params
        };

        return $http(options);
      },

      /**
       * Create new type
       *
       * @param  [{Object}]           params                  Parameters object
       * @param  [{String}]           params.type             Event type
       *
       * @return {Object}                                     Promise object
       */
      addNewType: function(params) {
        var options = {
          method: 'POST',
          url: '/api/event-types',
          data: params
        };
        return $http(options);
      }

    };

    return methods;
  }
]);
