var Follower = require('../../models/hub_follower');
var async = require('async');
var activityCb = require('../utils/activityCb');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {
  /**
   * GET /api/hub/:id/public/followers
   * Get hub's followers (public profiles only)
   */
  app.get('/api/hub/:id/public/followers', function(req, res, next) {
    var id = req.params.id;
    var query = req.query;
    var publicFollowers = [];
    Follower.find({hub: id})
      .sort(query.sort)
      .populate('hub user')
      .skip((query.page - 1) * query.size)
      .limit(query.size)
      .exec(function(err, followers) {
        if (err) {
          return next(new Error('Can not count hub public followers!'));
        }
        async.eachSeries(followers, function(follower, cb) {
          if (follower.user.is_public) {
            publicFollowers.push(follower);
          }
          cb(err);
        }, function(err) {
          if (err) {
            return next(new Error('Can not count hub public followers!'));
          }
          res.send({
            followers: publicFollowers,
            total: publicFollowers.length
          });
        });
      });
  });

  /**
   * GET /api/hub/:hubId/follower/:userId
   * Is user follows a hub
   */
  app.get('/api/hub/:hubId/follower/:userId', function(req, res, next) {
    var hubId = req.params.hubId;
    var userId = req.params.userId;
    Follower.findOne({hub: hubId, user: userId}).exec(function(err, existingFollower) {
      if (err) {
        return next(new Error('Can not get follower!'));
      }
      res.send({follower: existingFollower});
    });
  });

  /**
   * GET /api/hub/:id/followers
   * Get hub's followers
   */
  app.get('/api/hub/:id/followers', ensureAuthenticated, canAccess.if_admin_or_business_provider,
    function(req, res, next) {
      var id = req.params.id;
      Follower.count({hub: id}, function(err, count) {
        if (err) {
          return next(new Error('Can not count hub followers!'));
        }
        var query = req.query;
        Follower.find({hub: id})
          .sort(query.sort)
          .populate('hub user')
          .skip((query.page - 1) * query.size)
          .limit(query.size)
          .exec(function(err, followers) {
            if (err) {
              return next(new Error('Can not get hub followers!'));
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
  app.post('/api/hub/:hubId/follower/:userId', ensureAuthenticated, function(req, res, next) {

    var hubId = req.params.hubId;
    var userId = req.params.userId;
    Follower.findOne({hub: hubId, user: userId}).exec(function(err, existingFollower) {
      if (err) {
        return next(new Error('Can not check if the user follows the hub!'));
      }
      if (existingFollower) {
        return res.send({follower: existingFollower, error: {message: 'The user already follows the hub'}});
      }
      var follower = new Follower({
        hub: hubId,
        user: userId
      });
      follower.save(function(err) {
        if (err) {
          return next(new Error('Can not save follower!'));
        }
        Follower.populate(follower, {path: 'hub user'}, function(err, populatedFollower) {
          if (err) {
            return next(new Error('Can not follow the hub!'));
          }

          activityCb(userId, hubId, 'hub', 'hub followed', function(err) {
            if (err) {
              return next(new Error('Can not create an activity!'));
            }
            res.send({follower: populatedFollower, message: 'Hub has been followed'});
          });
        });
      });
    });
  });

  /**
   * DELETE /api/hub/:hubId/follower/:userId
   * User unfollows a hub
   */
  app.delete('/api/hub/:hubId/follower/:userId', ensureAuthenticated, function(req, res) {
    var hubId = req.params.hubId;
    var userId = req.params.userId;
    Follower.findOneAndRemove({hub: hubId, user: userId}).exec(function(err) {
      if (err) {
        return next(new Error('Can not unfollow the hub!'));
      }
      activityCb(userId, hubId, 'hub', 'hub unfollowed', function(err) {
        if (err) {
          return next(new Error('Can create an activity!'));
        }
        res.send({follower: null, message: 'Hub has been unfollowed'});
      });
    });
  });
};
