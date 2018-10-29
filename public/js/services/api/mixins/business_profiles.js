'use strict';

api.factory('BusinessProfilesAPI', [
  '$http',
  function($http) {

    var methods = {
      /**
       * Get full list of all business profiles
       *
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       * @param  [{Number}]           params.sort         Sort option
       * @param  [{Number}]           params.filter       Search filter
       *
       * @return {Object}                                 Promise object
       */
      getBusinessProfiles: function(params) {
        // no parameters are passed
        if (arguments.length === 0) {
          params = {};
        }

        var options = {
          method: 'GET',
          url: '/api/business_profiles',
          params: params
        };

        return $http(options);
      },

      /**
       * Get full list of all business profiles with subscription flag
       *
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       * @param  [{Number}]           params.sort         Sort option
       * @param  [{Number}]           params.filter       Search filter
       *
       * @return {Object}                                 Promise object
       */
      getBusinessProfilesSubscription: function(params) {
        // no parameters are passed
        if (arguments.length === 0) {
          params = {};
        }

        var options = {
          method: 'GET',
          url: '/api/business_profiles/subscription',
          params: params
        };

        return $http(options);
      },

      /**
       * Get business profile by id
       *
       * @param  [{Number}]           id                  Business profile id.
       *
       * @return {Object}                                 Promise object
       */
      getBusinessProfileById: function(id) {

        var options = {
          method: 'GET',
          url: '/api/business_profiles/' + id
        };

        return $http(options);
      },

      /**
       * Get business profiles by user id
       *
       * @param  [{Number}]           id                  User id.
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       * @param  [{Number}]           params.sort         Sort option
       *
       * @return {Object}                                 Promise object
       */
      getBusinessProfilesByUserId: function(id, params) {

        if (arguments.length === 1) {
          params = {};
        }

        params.sort = params.sort || '-date_created';

        var options = {
          method: 'GET',
          url: '/api/business_profiles/user/' + id,
          params: params
        };

        return $http(options);
      },

      /**
       * Activate/deactivate business profile
       *
       * @param  [{String}]           id                  Business profile id
       *
       * @return {Object}                                 Promise object
       */
      toggleBusinessProfile: function(id, params) {
        var options = {
          method: 'PUT',
          url: '/api/hubs/' + id + '/toggle'
        };
        return $http(options);
      },

      /**
       * Update business profile
       *
       * @param  [{Object}]           params                                Parameters object
       * @param  [{Number}]           params._id                            Business profile id
       * @param  [{String}]           params.name                           Business profile name
       * @param  [{String}]           params.address                        Business profile address
       * @param  [{String}]           params.email                          Business profile email
       * @param  [{String}]           params.phone                          Business profile phone
       * @param  [{String}]           params.website                        Business profile website
       * @param  [{String}]           params.description                    Business profile descriptions
       * @param  [{Object}]           params.location                       Business profile location
       * @param  [{String}]           params.location.display_name          Business profile location name
       * @param  [{Number}]           params.location.lat                   Business profile location latitude
       * @param  [{Number}]           params.location.lng                   Business profile location longitude
       * @param  [{String}]           params.logo                           Business profile logo
       * @param  [{String}]           params.coverImage                     Business profile coverImage
       * @param  [{String}]           params.primary_category               Business profile primary category
       * @param  [{String}]           params.secondary_category             Business profile secondary category
       * @param  [{String}]           params.tertiary_category              Business profile tertiary category
       *
       * @return {Object}                                     Promise object
       */
      updateBusinessProfile: function(params) {
        var options = {
          method: 'POST',
          url: '/api/business_profiles/' + params._id,
          data: params
        };

        return $http(options);
      },

      /**
       * Create business profile
       *
       * @param  [{Object}]           params                                Parameters object
       * @param  [{String}]           params.name                           Business profile name
       * @param  [{String}]           params.address                        Business profile address
       * @param  [{String}]           params.email                          Business profile email
       * @param  [{String}]           params.phone                          Business profile phone
       * @param  [{String}]           params.website                        Business profile website
       * @param  [{String}]           params.description                    Business profile descriptions
       * @param  [{Object}]           params.location                       Business profile location
       * @param  [{String}]           params.location.display_name          Business profile location name
       * @param  [{Number}]           params.location.lat                   Business profile location latitude
       * @param  [{Number}]           params.location.lng                   Business profile location longitude
       * @param  [{String}]           params.logo                           Business profile logo
       * @param  [{String}]           params.coverImage                     Business profile coverImage
       * @param  [{String}]           params.primary_category               Business profile primary category
       * @param  [{String}]           params.secondary_category             Business profile secondary category
       * @param  [{String}]           params.tertiary_category              Business profile tertiary category
       *
       * @return {Object}                                     Promise object
       */
      createBusinessProfile: function(params) {
        var options = {
          method: 'POST',
          url: '/api/business_profiles',
          data: params
        };

        return $http(options);
      },

      /**
       * Get events associated with the selected business profile
       *
       * @param  [{String}]           id                  Business profile ID
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       *
       * @return {Object}                                 Promise object
       */
      getBusinessProfileEvents: function(id, params) {

        var options = {
          method: 'GET',
          url: '/api/business_profiles/' + id + '/events',
          params: params
        };
        return $http(options);
      },

      /**
       * Get business profile followers
       *
       * @param  [{String}]           id                  Business profile ID
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       * @param  [{Number}]           params.sort         Sort option
       *
       * @return {Object}                                 Promise object
       */
      getBusinessProfileFollowers: function(id, params) {

        var options = {
          method: 'GET',
          url: '/api/business_profiles/' + id + '/followers',
          params: params
        };
        return $http(options);
      },

      /**
       * Get business profile public followers
       *
       * @param  [{String}]           id                  Business profile ID
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       * @param  [{Number}]           params.sort         Sort option
       *
       * @return {Object}                                 Promise object
       */
      getBusinessProfilePublicFollowers: function(id, params) {

        var options = {
          method: 'GET',
          url: '/api/business_profiles/' + id + '/public/followers',
          params: params
        };
        return $http(options);
      },

      /**
       * Get top businesses
       *
       * @param  [{Number}]           count               Size of result set to return
       *
       * @return {Object}                                 Promise object
       */
      getTopBusinesses: function(count) {

        var options = {
          method: 'GET',
          url: '/api/business_profiles/top/' + count
        };
        return $http(options);
      },

      /**
       * Follow business profile
       *
       * @param  [{Number}]           profileId           Profile id to follow
       * @param  [{Number}]           userId              Follower id
       *
       * @return {Object}                                 Promise object
       */
      followBusinessProfile: function(profileId, userId) {

        var options = {
          method: 'POST',
          url: '/api/business_profile/' + profileId + '/follower/' + userId
        };
        return $http(options);
      },

      /**
       * Unfollow business profile
       *
       * @param  [{Number}]           profileId           Profile id to follow
       * @param  [{Number}]           userId              Follower id
       *
       * @return {Object}                                 Promise object
       */
      unfollowBusinessProfile: function(profileId, userId) {

        var options = {
          method: 'DELETE',
          url: '/api/business_profile/' + profileId + '/follower/' + userId
        };
        return $http(options);
      },

      /**
       * Is a business profile followed by user
       *
       * @param  [{Number}]           profileId           Profile id
       * @param  [{Number}]           userId              Follower id
       *
       * @return {Object}                                 Promise object
       */
      isBusinessProfileFollowedByUser: function(profileId, userId) {

        var options = {
          method: 'GET',
          url: '/api/business_profile/' + profileId + '/follower/' + userId
        };
        return $http(options);
      }
    };

    return methods;
  }
]);
