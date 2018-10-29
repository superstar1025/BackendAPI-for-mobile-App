var mongoose = require('mongoose');
var secrets = require('../../config/secrets');
var async = require('async');
var _ = require('lodash');

module.exports = function(grunt) {

  var collections = ['activities', 'events', 'hubs', 'tags'];
  var existingCollections = [];

  grunt.registerTask('dropTestDB', 'drop the test database', function() {
    var done = this.async();

    var handler = function(collection, cb) {
      mongoose.connection.db.dropCollection(collection, function(err) {
        cb(err)
      });
    };
    var finalCallback = function(err) {
      if (err) {
        console.log(err);
      } else {
        console.log('Successfully dropped collections');
      }
      mongoose.connection.close(done);
    };

    mongoose.connect(secrets.db.test);
    mongoose.connection.on('open', function() {
      mongoose.connection.db.collectionNames(function(err, names) {
        names.forEach(function(el, idx) {
          var name = el.name;
          name = name.replace('netminov2_test.', '');
          existingCollections.push(name);
        });
        async.each(_.intersection(collections, existingCollections), handler, finalCallback);
      });
    });
  });
};
