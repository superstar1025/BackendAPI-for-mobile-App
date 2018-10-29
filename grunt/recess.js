module.exports = {
  app: {
    files: [
      {
        'public/css/app.css': ['public/css/less/app.less']
      }
    ],
    options: {
      compile: true
    }
  },
  min: {
    files: {
      'public/dist/css/app.min.css': [
        'public/js/components/bootstrap/dist/css/bootstrap.css',
        'public/css/*.css',
        'public/js/components/leaflet/dist/leaflet.css',
        'public/js/components/font-awesome/css/font-awesome.min.css',
        'public/fonts/simplelineicons/simple-line-icons.css',
        'public/js/components/angular-block-ui/dist/angular-block-ui.min.css',
        'public/js/components/angular-growl/build/angular-growl.min.css'
      ]
    },
    options: {
      compress: true
    }
  }
};
