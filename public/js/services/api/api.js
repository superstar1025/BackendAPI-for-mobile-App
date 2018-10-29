'use strict';

api.factory('API', [
  'UsersAPI',
  'RolesAPI',
  'HubsAPI',
  'EventsAPI',
  'EventTypesAPI',
  'TagsAPI',
  'ActivitiesAPI',
  'BusinessProfilesAPI',
  'BusinessCategoriesAPI',
  'AuthAPI',
  'TracksAPI',
  function(UsersAPI,
           RolesAPI,
           HubsAPI,
           EventsAPI,
           EventTypesAPI,
           TagsAPI,
           ActivitiesAPI,
           BusinessProfilesAPI,
           BusinessCategoriesAPI,
           AuthAPI,
           TracksAPI) {

    var api = {
      Users: {},
      Roles: {},
      Hubs: {},
      Events: {},
      EventTypes: {},
      Tags: {},
      Activities: {},
      BusinessProfiles: {},
      BusinessCategories: {},
      Auth: {},
      Tracks: {}
    };

    angular.extend(api.Users, UsersAPI);
    angular.extend(api.Roles, RolesAPI);
    angular.extend(api.Hubs, HubsAPI);
    angular.extend(api.Events, EventsAPI);
    angular.extend(api.EventTypes, EventTypesAPI);
    angular.extend(api.Tags, TagsAPI);
    angular.extend(api.Activities, ActivitiesAPI);
    angular.extend(api.BusinessProfiles, BusinessProfilesAPI);
    angular.extend(api.BusinessCategories, BusinessCategoriesAPI);
    angular.extend(api.Auth, AuthAPI);
    angular.extend(api.Tracks, TracksAPI);

    return api;
  }
]);
