var Follower = require('../../models/business_follower');
var async = require('async');
var activityCb = require('../utils/activityCb');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {
  /**
   * GET /api/business_profile/:id/public/followers
   * Get business's followers (public profiles only)
   */
  app.get('/api/business_profiles/:id/public/followers', function(req, res, next) {
    var id = req.params.id;
    var query = req.query;
    var publicFollowers = [];
    Follower.find({business: id})
      .sort(query.sort)
      .populate('business user')
      .skip((query.page - 1) * query.size)
      .limit(query.size)
      .exec(function(err, followers) {
        if (err) {
          return next(new Error('Can not count business public followers!'));
        }
        async.eachSeries(followers, function(follower, cb) {
          if (follower.user.is_public) {
            publicFollowers.push(follower);
          }
          cb(err);
        }, function(err) {
          if (err) {
            return next(new Error('Can not get business public followers!'));
          }
          res.send({
            followers: publicFollowers,
            total: publicFollowers.length
          });
        });
      });
  });

  /**
   * Get /api/business_profiles/:businessId/follower/:userId
   * Is user follows a business profile
   */
  app.get('/api/business_profile/:businessId/follower/:userId', function(req, res, next) {
    var businessId = req.params.businessId;
    var userId = req.params.userId;
    Follower.findOne({business: businessId, user: userId}).exec(function(err, existingFollower) {
      if (err) {
        return next(new Error('Can not check if the user follows the business!'));
      }
      res.send({follower: existingFollower});
    });
  });

  /**
   * GET /api/business_profile/:id/followers
   * Get business's followers
   */
  app.get('/api/business_profiles/:id/followers', ensureAuthenticated,
    function(req, res, next) {
      var id = req.params.id;
      Follower.count({business: id}, function(err, count) {
        if (err) {
          return next(new Error('Can not count business followers!'));
        }
        var query = req.query;
        Follower.find({business: id})
          .sort(query.sort)
          .populate('business user')
          .skip((query.page - 1) * query.size)
          .limit(query.size)
          .exec(function(err, followers) {
            if (err) {
              return next(new Error('Can not get business followers!'));
            }
            res.send({
              followers: followers,
              total: count
            });
          });
      });
    });

  /**
   * POST /api/business_profiles/:businessId/follower/:userId
   * User follows a business profile
   */
  app.post('/api/business_profile/:businessId/follower/:userId', ensureAuthenticated,
    function(req, res, next) {

      var businessId = req.params.businessId;
      var userId = req.params.userId;
      Follower.findOne({business: businessId, user: userId}).exec(function(err, existingFollower) {
        if (err) {
          return next(new Error('Can not check if the user follows the business!'));
        }
        if (existingFollower) {
          return res.send({follower: existingFollower, error: {message: 'The user already follows the business'}});
        }
        var follower = new Follower({
          business: businessId,
          user: userId
        });
        follower.save(function(err) {
          if (err) {
            return next(new Error('Can not save follower!'));
          }
          Follower.populate(follower, {path: 'business user'}, function(err, populatedFollower) {
            if (err) {
              return next(new Error('Can not get follower data!'));
            }

            activityCb(userId, businessId, 'business', 'business followed', function(err) {
              if (err) {
                return next(new Error('Can not create an activity!'));
              }
              res.send({follower: populatedFollower, message: 'Busines profile has been followed'});
            });
          });
        });
      });
    });

  /**
   * DELETE /api/business_profiles/:businessId/follower/:userId
   * User unfollows a business profile
   */
  app.delete('/api/business_profile/:businessId/follower/:userId', ensureAuthenticated,
    function(req, res, next) {
      var businessId = req.params.businessId;
      var userId = req.params.userId;
      Follower.findOneAndRemove({business: businessId, user: userId}).exec(function(err) {
        if (err) {
          return next(new Error('Can not unfollow the business profile!'));
        }
        activityCb(userId, businessId, 'business', 'business unfollowed', function(err) {
          if (err) {
            return next(new Error('Can not create an activity!'));
          }
          res.send({follower: null, message: 'Busines profile has been unfollowed'});
        });
      });
    });
};
