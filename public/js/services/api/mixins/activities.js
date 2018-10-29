'use strict';

api.factory('ActivitiesAPI', [
  '$http',
  function($http) {

    var methods = {
      /**
       * Get full list of all Activities
       *
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       *
       * @return {Object}                                 Promise object
       */
      getActivities: function(params) {
        // no parameters are passed
        if (arguments.length === 0) {
          params = {};
        }

        params.sort = params.sort || '-date_created';

        var options = {
          method: 'GET',
          url: '/api/activities',
          params: params
        };

        return $http(options);
      }
    };

    return methods;
  }
]);
