var User = require('../../models/user');
var async = require('async');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {

  /**
   * POST /api/user/:userId/friend/:friendId
   * User adds another user as friend
   */
  app.post('/api/user/:userId/friend/:friendId', ensureAuthenticated, function(req, res, next) {

    var userId = req.params.userId;
    var friendId = req.params.friendId;

    User.requestFriend(userId, friendId, function(err) {
      if (err) {
        return next(new Error('Can not request friendship!'));
      }
      User.findById(userId, function(err, user) {
        if (err) {
          return next(new Error('Can not get user!'));
        }
        User.getFriends(user, {_id: friendId}, function(err, friendships) {
          if (err) {
            return next(new Error('Can not get user friends!'));
          }
          res.send({
            user: user,
            friendships: friendships[0]
          });
        });
      });
    });
  });

  /**
   * DELETE /api/user/:userId/friend/:friendId
   * User deletes friend
   */

  app.delete('/api/user/:userId/friend/:friendId', ensureAuthenticated, function(req, res, next) {
    var userId = req.params.userId;
    var friendId = req.params.friendId;

    User.findById(userId, function(err, user) {
      if (err) {
        return next(new Error('Can not get user!'));
      }
      User.findById(friendId, function(err, badfriend) {
        if (err) {
          return next(new Error('Can not get user friend!'));
        }
        User.removeFriend(user, badfriend, function(err) {
          if (err) {
            return next(new Error('Can not unfriend user!'));
          }
          res.send({
            user: user,
            friendships: null
          });
        });
      });
    });
  });

  /**
   * GET /api/user/:id/friends
   * Get user friends
   */
  app.get('/api/user/:id/friends', ensureAuthenticated,
    function(req, res, next) {
      var id = req.params.id;

      User.findById(id, function(err, user) {
        if (err) {
          return next(new Error('Can not get user!'));
        }
        User.getFriends(user, function(err, friendships) {
          if (err) {
            return next(new Error('Can not get user friends!'));
          }
          res.send({
            user: user,
            friendships: friendships
          });
        });
      })
    });

  /**
   * GET /api/user/:id/friend/:friendId
   * Are users friends
   */
  app.get('/api/user/:id/friend/:friendId', ensureAuthenticated,
    function(req, res, next) {
      var userId = req.params.id;
      var friendId = req.params.friendId;

      User.findById(userId, function(err, user) {
        if (err) {
          return next(new Error('Can not get user!'));
        }
        User.getFriends(user, {_id: friendId}, function(err, friendships) {
          if (err) {
            return next(new Error('Can not get user friend!'));
          }

          res.send({
            user: user,
            friendships: friendships[0]
          });
        });
      })
    });
};
