var Activity = require('../../models/activity');
var _ = require('lodash');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {
  /**
   * GET /api/activities
   * Get all activities
   */
  app.get('/api/activities', ensureAuthenticated, canAccess.if_admin, function(req, res, next) {
    Activity.count({}, function(err, count) {
      if (err) {
        return next(new Error('Can not count activities!'));
      }
      var query = req.query;
      Activity.find()
        .sort(query.sort)
        .populate('created_by hub event business')
        .skip((query.page - 1) * query.size)
        .limit(query.size)
        .exec(function(err, activities) {
          if (err) {
            return next(new Error('Can not get activities!'));
          }
          res.send({
            data: activities,
            total: count
          });
        });
    });
  });
};
