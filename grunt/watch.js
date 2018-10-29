module.exports = {
  js: {
    files: ['public/js/**/*.js', '!public/js/components/**'],
    options: {
      livereload: true
    }
  },
  html: {
    files: [
      'views/**',
      'public/tpl/**/*.html'
    ],
    options: {
      livereload: true,
      interval: 500
    }
  },
  css: {
    files: ['public/css/less/**'],
    tasks: ['recess:app'],
    options: {
      livereload: true
    }
  }
};
