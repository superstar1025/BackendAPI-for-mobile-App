var registerDropDBTask = require('./grunt/testDbTasks/dropDB.js');
module.exports = function(grunt) {
  registerDropDBTask(grunt);
  var gtx = require('gruntfile-gtx').wrap(grunt);
  gtx.loadAuto();
  var gruntConfig = require('./grunt');
  gruntConfig.package = require('./package.json');
  gtx.config(gruntConfig);
  gtx.alias('run', ['concurrent']);
  gtx.alias('e2e',  ['dropTestDB', 'protractor:default']);
  gtx.alias('build:dev',  ['recess:app', 'replace:dev']);
  gtx.alias('build:dist', ['clean:dist', 'copy:dist', 'recess:app', 'replace:dist', 'recess:min',
    'concat:dist', 'uglify:dist', 'clean:dists']);
  gtx.alias('heroku', ['build:dist']);
  gtx.finalise();
};
