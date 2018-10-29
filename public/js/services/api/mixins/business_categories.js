'use strict';

api.factory('BusinessCategoriesAPI', [
  '$http',
  function($http) {

    var methods = {
      /**
       * Get primary categories
       *
       * @return {Object}                                 Promise object
       */
      getPrimaryBusinessCategories: function(params) {

        if (arguments.length === 0) {
          params = {};
        }

        params.sort = params.sort || 'name';

        var options = {
          method: 'GET',
          url: '/api/business_categories/primary',
          params: params
        };

        return $http(options);
      },

      /**
       * Get categories by parent category ID
       *
       * @param  [{Number}]           id     Parent category ID
       *
       * @return {Object}                    Promise object
       */
      getBusinessCategoriesByParentId: function(id, params) {

        if (arguments.length === 1) {
          params = {};
        }

        params.sort = params.sort || 'name';

        var options = {
          method: 'GET',
          url: '/api/business_categories/' + id,
          params: params
        };

        return $http(options);
      }

    };

    return methods;
  }
]);
