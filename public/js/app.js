'use strict';

var api = angular.module('netmino.api', []);
var underscore = angular.module('underscore', []);

var app = angular.module('app', [
  'ngCookies',
  'ngSanitize',
  'ngTouch',
  'ngStorage',
  'ui.router',
  'ui.bootstrap',
  'ui.utils',
  'ui.load',
  'ui.jq',
  'oc.lazyLoad',
  'pascalprecht.translate',
  'geolocation',
  'leaflet-directive',
  'netmino.api',
  'angular-growl',
  'blockUI',
  'underscore',
  'satellizer'
]);
