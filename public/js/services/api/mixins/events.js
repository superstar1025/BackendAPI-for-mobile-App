'use strict';

api.factory('EventsAPI', [
  '$http',
  function($http) {

    var methods = {

      /**
       * Create new event
       *
       * @param  [{Object}]           event                   Event object
       * @return {Object}                                     Promise object
       */
      addNewEvent: function(event) {
        var options = {
          method: 'POST',
          url: '/api/events',
          data: event
        };
        return $http(options);
      },

      /**
       * Update event
       *
       * @param  [{Object}]           event                   Event object
       * @return {Object}                                     Promise object
       */
      updateEvent: function(event) {
        var options = {
          method: 'POST',
          url: '/api/events/' + event._id,
          data: event
        };
        return $http(options);
      },

      /**
       * Get list of all Events
       *
       * @param  [{Object}]           params              Parameters object
       * @param  [{Datetime}]         params.date         Events datetime
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       *
       * @return {Object}                                 Promise object
       */
      getAllEvents: function(params) {
        var options = {
          method: 'GET',
          url: '/api/events',
          params: params
        };
        return $http(options);
      },

      /**
       * Get event by Id
       *
       * @param  [{String}]           id                  Event Id
       *
       * @return {Object}                                 Promise object
       */
      getEventById: function(id) {
        var options = {
          method: 'GET',
          url: '/api/events/' + id
        };
        return $http(options);
      }
    };
    return methods;
  }
]);
