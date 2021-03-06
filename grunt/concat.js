module.exports = {
  dist:{
    src:[
      'public/js/components/jquery/dist/jquery.js',
      'public/js/components/angular/angular.js',
      'public/js/components/satellizer/satellizer.js',
      'public/js/components/leaflet/dist/leaflet.js',
      'public/js/components/angularjs-geolocation/src/geolocation.js',
      'public/js/components/angular-leaflet-directive/dist/angular-leaflet-directive.js',
      'public/js/components/bootstrap/dist/js/bootstrap.js',
      'public/js/components/angular-cookies/angular-cookies.js',
      'public/js/components/angular-sanitize/angular-sanitize.js',
      'public/js/components/angular-touch/angular-touch.js',
      'public/js/components/angular-ui-router/release/angular-ui-router.js',
      'public/js/components/angular-bootstrap/ui-bootstrap-tpls.js',
      'public/js/components/angular-translate/angular-translate.js',
      'public/js/components/angular-ui-utils/ui-utils.js',
      'public/js/components/ngstorage/ngStorage.js',
      'public/js/components/angular-growl/build/angular-growl.min.js',
      'public/js/components/angular-block-ui/dist/angular-block-ui.min.js',
      'public/js/components/underscore/underscore-min.js',
      'public/js/components/oclazyload/dist/ocLazyLoad.js',

      'public/js/app.js',
      'public/js/config.js',
      'public/js/config.lazyload.js',
      'public/js/config.router.js',
      'public/js/main.js',
      'public/js/directives/*.js',
      'public/js/services/**/*.js',
      'public/js/filters/*.js',
      'public/js/modules/*.js',
      'public/js/decorators/*.js',

      'public/js/controllers/modals/*.js',
      'public/js/controllers/pages/*.js'
    ],
    dest:'public/dist/js/dist.js'
  }
};
