'use strict';

api.factory('UsersAPI', [
  '$http',
  function($http) {

    var methods = {
      /**
       * Get full list of all Users
       *
       * @param  [{Object}]           params              Parameters object
       * @param  [{Number}]           params.size         Page size of result set to return.
       * @param  [{Number}]           params.page         Page number of result set to return
       * @param  [{String}]           params.role         Filter users by the role
       * @param  [{String}]           params.sort         Sort option
       *
       * @return {Object}                                 Promise object
       */
      getUsers: function(params) {
        // no parameters are passed
        if (arguments.length === 0) {
          params = {};
        }

        params.sort = params.sort || '-date_created';

        var options = {
          method: 'GET',
          url: '/api/users',
          params: params
        };

        return $http(options);
      },

      /**
       * Get total number of users by roles
       *
       * @return {Object}                                 Promise object
       */
      getTotalUsersByRoles: function() {

        var options = {
          method: 'GET',
          url: '/api/users/roles'
        };

        return $http(options);
      },

      /**
       * Update user role
       *
       * @param  [{String}]           id                  User id
       * @param  [{Object}]           params              Parameters object
       * @param  [{Object}]           params.role         Role to be set
       *
       * @return {Object}                                 Promise object
       */
      updateRole: function(id, params) {
        var options = {
          method: 'PUT',
          url: '/api/users/' + id,
          data: params
        };
        return $http(options);
      },
      /**
       * Get user profile by id
       *
       * @param  [{String}]           id                  User id
       *
       * @return {Object}                                 Promise object
       */
      getUserById: function(id) {
        var options = {
          method: 'GET',
          url: '/api/users/' + id
        };

        return $http(options);
      },

      /**
       * Update user profile
       *
       * @param  [{String}]           id                              User id
       * @param  [{Object}]           params                          Parameters object
       * @param  [{String}]           params.email                    Email
       * @param  [{String}]           params.gender                   Gender
       * @param  [{String}]           params.name                     Name
       * @param  [{Object}]           params.location                 Location
       * @param  [{Number}]           params.location.lat             Latitude
       * @param  [{Number}]           params.location.lng             Longitude
       * @param  [{String}]           params.location.display_name    Location display name
       *
       * @return {Object}                                             Promise object
       */
      updateProfile: function(id, params) {
        var options = {
          method: 'POST',
          url: '/api/users/' + id,
          data: params
        };

        return $http(options);
      },
      /**
       * Update user password
       *
       * @param  [{String}]           id                        User id
       * @param  [{Object}]           params                    Parameters object
       * @param  [{Object}]           params.password           New password
       * @param  [{Object}]           params.confirmPassword    New password confirmation
       *
       * @return {Object}                                       Promise object
       */
      updatePassword: function(id, params) {
        var options = {
          method: 'POST',
          url: '/api/users/' + id + '/password',
          data: params
        };

        return $http(options);
      },
      /**
       * Activate/deactivate user account
       *
       * @param  [{String}]           id                  User id
       * @param  [{Object}]           params              Parameters
       * @param  [{Boolean}]          params.is_active    User active state to set
       *
       * @return {Object}                                 Promise object
       */
      toggleAccount: function(id, params) {
        var options = {
          method: 'PUT',
          url: '/api/users/' + id + '/toggle',
          data: params
        };
        return $http(options);
      },

      /**
       * Create new user account
       *
       * @param  [{Object}]           params                  Parameters object
       * @param  [{String}]           params.name             User name
       * @param  [{String}]           params.email            User email
       * @param  [{String}]           params.password         User password
       * @param  [{String}]           params.confirmPassword  Password confirmation
       *
       * @return {Object}                                     Promise object
       */
      addNewUser: function(params) {
        var options = {
          method: 'POST',
          url: '/api/users',
          data: params
        };
        return $http(options);
      },

      /**
       * Get user friends
       *
       * @param  [{String}]           id                  User ID
       *
       * @return {Object}                                 Promise object
       */
      getUserFriends: function(id) {

        var options = {
          method: 'GET',
          url: '/api/user/' + id + '/friends'
        };
        return $http(options);
      },

      /**
       * Add user friend
       *
       * @param  [{Number}]           userId              User id
       * @param  [{Number}]           friendId            User friend id
       *
       * @return {Object}                                 Promise object
       */
      addUserAsFriend: function(userId, friendId) {

        var options = {
          method: 'POST',
          url: '/api/user/' + userId + '/friend/' + friendId
        };
        return $http(options);
      },

      /**
       * Remove user friend
       *
       * @param  [{Number}]           userId              User id
       * @param  [{Number}]           friendId            User friend id
       *
       * @return {Object}                                 Promise object
       */
      removeFriend: function(userId, friendId) {

        var options = {
          method: 'DELETE',
          url: '/api/user/' + userId + '/friend/' + friendId
        };
        return $http(options);
      },

      /**
       * Are users friends
       *
       * @param  [{Number}]           profileId           Profile id to follow
       * @param  [{Number}]           userId              Follower id
       *
       * @return {Object}                                 Promise object
       */
      areUsersFriends: function(userId, friendId) {

        var options = {
          method: 'GET',
          url: '/api/user/' + userId + '/friend/' + friendId
        };
        return $http(options);
      }

    };

    return methods;
  }
]);
