/**
 * This service has the responsability to search a location.
 */
'use strict';
app.service('Geosearch', ['$http', '$window', function($http, $window) {
  return {
    search: function(q, success, error) {
      var url = $window.location.protocol + '//nominatim.openstreetmap.org/search?format=json&q=' + q;
      $http.get(url)
        .success(function(loc) {
          try {
            return success({
              display_name: loc[0].display_name,
              lng: Number(loc[0].lon),
              lat: Number(loc[0].lat)
            });
          } catch (e) {
            error(e);
          }
        }).error(error);
    }
  };
}]);
