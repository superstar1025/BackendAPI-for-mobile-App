// lazyload config

app
/**
 * jQuery plugin config use ui-jq directive , config the js and css files that required
 * key: function name of the jQuery plugin
 * value: array of the css js file located
 */
  .constant('JQ_CONFIG', {
    filestyle: ['js/components/bootstrap-filestyle/src/bootstrap-filestyle.js']
  }
)
  // oclazyload config
  .config(['$ocLazyLoadProvider', function($ocLazyLoadProvider) {
    // We configure ocLazyLoad to use the lib script.js as the async loader
    $ocLazyLoadProvider.config({
      debug: true,
      events: true,
      modules: [
        {
          name: 'ngGrid',
          files: [
            'js/components/ng-grid/build/ng-grid.min.js',
            'js/components/ng-grid/ng-grid.min.css',
            'css/theme-ng-grid.css'
          ]
        },
        {
          name: 'ui.grid',
          files: [
            'js/components/angular-ui-grid/ui-grid.min.js',
            'js/components/angular-ui-grid/ui-grid.min.css'
          ]
        },
        {
          name: 'ui.select',
          files: [
            'js/components/angular-ui-select/dist/select.min.js',
            'js/components/angular-ui-select/dist/select.min.css'
          ]
        },
        {
          name: 'angularFileUpload',
          files: [
            'js/components/angular-file-upload/angular-file-upload.js'
          ]
        },
        {
          name: 'xeditable',
          files: [
            'js/components/angular-xeditable/dist/js/xeditable.min.js',
            'js/components/angular-xeditable/dist/css/xeditable.css'
          ]
        }
      ]
    });
  }]);
