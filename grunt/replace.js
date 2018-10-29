module.exports = {
  dist: {
    options: {
      patterns: [
        {
          match: 'timestamp',
          replacement: '<%= new Date().getTime() %>'
        },
        {
          match: 'googleClientId',
          replacement: '920583869927-bifh41lltvj6j9qas2fae8ip981anlf6.apps.googleusercontent.com'
        },
        {
          match: 'facebookClientId',
          replacement: '1431261620506078'
        }
      ]
    },
    files: [
      {src: ['views/partials/scripts_tpl.jade'], dest: 'views/partials/scripts.jade'},
      {src: ['views/partials/styles_tpl.jade'], dest: 'views/partials/styles.jade'},
      {src: ['public/js/config_tpl.js'], dest: 'public/js/config.js'}
    ]
  },
  dev: {
    options: {
      patterns: [
        {
          match: 'timestamp',
          replacement: '<%= new Date().getTime() %>'
        },
        {
          match: 'googleClientId',
          replacement: '920583869927-tlsvrkg0l9sfoc4vaom6731ae0ijhgfk.apps.googleusercontent.com'
        },
        {
          match: 'facebookClientId',
          replacement: '670993679677082'
        }
      ]
    },
    files: [
      {src: ['views/partials/scripts_tpl.jade'], dest: 'views/partials/scripts.jade'},
      {src: ['views/partials/styles_tpl.jade'], dest: 'views/partials/styles.jade'},
      {src: ['public/js/config_tpl.js'], dest: 'public/js/config.js'}
    ]
  }
};
