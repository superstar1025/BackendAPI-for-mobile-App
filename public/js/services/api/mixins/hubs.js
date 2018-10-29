'use strict';

api.factory('HubsAPI', [
  '$http',
  function($http) {

    var methods = {
      /**
       * Get full list of all Interest groups
       *
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       * @param  [{String}]           params.name         Name filter
       * @param  [{String}]           params.filter   Hubs filter (All, New, My, Following, Muted)
       *
       * @return {Object}                                 Promise object
       */
      getHubs: function(params) {
        // no parameters are passed
        if (arguments.length === 0) {
          params = {};
        }

        var options = {
          method: 'GET',
          url: '/api/hubs',
          params: params
        };

        return $http(options);
      },

      /**
       * Update hub by id
       *
       * @param  [{String}]           id              Hub id
       * @param  [{Object}]           params          Parameters object
       * @param  [{String}]           params.group    Group
       *
       * @return {Object}                             Promise object
       */
      updateHub: function(id, params) {
        var options = {
          method: 'POST',
          url: '/api/hubs/update/' + id,
          data: params
        };

        return $http(options);
      },

      /**
       * Activate/deactivate hub
       *
       * @param  [{String}]           id                  Hub id
       * @param  [{Object}]           params              Parameters
       * @param  [{Boolean}]          is_active           Hub active state to set
       * @return {Object}                                 Promise object
       */
      toggleHub: function(id, params) {
        var options = {
          method: 'PUT',
          url: '/api/hubs/' + id + '/toggle',
          data: params
        };
        return $http(options);
      },

      /**
       * Create new group
       *
       * @param  [{Object}]           params                  Parameters object
       * @param  [{String}]           params.group            Group
       *
       * @return {Object}                                     Promise object
       */
      addNewHub: function(params) {
        var options = {
          method: 'POST',
          url: '/api/hubs',
          data: params
        };
        return $http(options);
      },

      /**
       * Get top hubs
       *
       * @param  [{Number}]           count               Size of result set to return
       *
       * @return {Object}                                 Promise object
       */
      getTopHubs: function(count) {

        var options = {
          method: 'GET',
          url: '/api/hubs/top/' + count
        };
        return $http(options);
      },

      /**
       * Get hub followers
       *
       * @param  [{String}]           id                  Hub ID
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       * @param  [{Number}]           params.sort         Sort option
       *
       * @return {Object}                                 Promise object
       */
      getHubFollowers: function(id, params) {

        var options = {
          method: 'GET',
          url: '/api/hub/' + id + '/followers',
          params: params
        };
        return $http(options);
      },

      /**
       * Get hub public followers
       *
       * @param  [{String}]           id                  Hub ID
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       * @param  [{Number}]           params.sort         Sort option
       *
       * @return {Object}                                 Promise object
       */
      getHubPublicFollowers: function(id, params) {

        var options = {
          method: 'GET',
          url: '/api/hub/' + id + '/public/followers',
          params: params
        };
        return $http(options);
      },

      /**
       * Follow hub
       *
       * @param  [{Number}]           hubId               Hub id to follow
       * @param  [{Number}]           userId              Follower id
       *
       * @return {Object}                                 Promise object
       */
      followHub: function(hubId, userId) {

        var options = {
          method: 'POST',
          url: '/api/hub/' + hubId + '/follower/' + userId
        };
        return $http(options);
      },

      /**
       * Unfollow hub
       *
       * @param  [{Number}]           hubId               Hub id to follow
       * @param  [{Number}]           userId              Follower id
       *
       * @return {Object}                                 Promise object
       */
      unfollowHub: function(hubId, userId) {

        var options = {
          method: 'DELETE',
          url: '/api/hub/' + hubId + '/follower/' + userId
        };
        return $http(options);
      },

      /**
       * Is a hub followed by user
       *
       * @param  [{Number}]           hubId               Hub id
       * @param  [{Number}]           userId              Follower id
       *
       * @return {Object}                                 Promise object
       */
      isHubFollowedByUser: function(hubId, userId) {

        var options = {
          method: 'GET',
          url: '/api/hub/' + hubId + '/follower/' + userId
        };
        return $http(options);
      },

      /**
       * Follow hub
       *
       * @param  [{Number}]           hubId               Hub id to follow
       * @param  [{Number}]           userId              Follower id
       *
       * @return {Object}                                 Promise object
       */
      muteHub: function(hubId, userId) {

        var options = {
          method: 'POST',
          url: '/api/hub/' + hubId + '/muter/' + userId
        };
        return $http(options);
      },

      /**
       * Unfollow hub
       *
       * @param  [{Number}]           hubId               Hub id to follow
       * @param  [{Number}]           userId              Follower id
       *
       * @return {Object}                                 Promise object
       */
      unmuteHub: function(hubId, userId) {

        var options = {
          method: 'DELETE',
          url: '/api/hub/' + hubId + '/muter/' + userId
        };
        return $http(options);
      },

      /**
       * Is a hub followed by user
       *
       * @param  [{Number}]           hubId               Hub id
       * @param  [{Number}]           userId              Follower id
       *
       * @return {Object}                                 Promise object
       */
      isHubMutedByUser: function(hubId, userId) {

        var options = {
          method: 'GET',
          url: '/api/hub/' + hubId + '/muter/' + userId
        };
        return $http(options);
      },

      /**
       * Get hub by Id
       *
       * @param  [{Number}]           id                  Hub id
       *
       * @return {Object}                                 Promise object
       */
      getHubById: function(id) {
        var options = {
          method: 'GET',
          url: '/api/hubs/' + id
        };
        return $http(options);
      }

    };

    return methods;
  }
]);
