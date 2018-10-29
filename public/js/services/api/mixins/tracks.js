'use strict';

api.factory('TracksAPI', [
  '$http',
  function($http) {
  var methods = {
    getTracks: function(params) {
      // no parameters are passed
      if (arguments.length === 0) {
        params = {};
      }

      var options = {
        method: 'GET',
        url: '/api/tracks/currentuser',
        params: params
      };

      return $http(options);
    },

    saveTrack: function(data) {
      var options = {
        method: 'POST',
        url: '/api/tracks/markers',
        data: data
      };
      return $http(options);
    }
  };
  return methods;
}]);
