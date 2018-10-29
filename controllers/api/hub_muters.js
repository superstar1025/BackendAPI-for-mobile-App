var Muter = require('../../models/hub_muter');
var async = require('async');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {
  /**
   * GET /api/hub/:hubId/muter/:userId
   * Is hub muted by user
   */
  app.get('/api/hub/:hubId/muter/:userId', function(req, res, next) {
    var hubId = req.params.hubId;
    var userId = req.params.userId;
    Muter.findOne({hub: hubId, user: userId}).exec(function(err, existingMuter) {
      if (err) {
        return next(new Error('Can not get muter!'));
      }
      res.send({muter: existingMuter});
    });
  });

  /**
   * POST /api/hub/:hubId/muter/:userId
   * User mutes a hub
   */
  app.post('/api/hub/:hubId/muter/:userId', ensureAuthenticated, function(req, res, next) {

    var hubId = req.params.hubId;
    var userId = req.params.userId;
    Muter.findOne({hub: hubId, user: userId}).exec(function(err, existingMuter) {
      if (err) {
        return next(new Error('Can not get muter!'));
      }
      if (existingMuter) {
        return res.send({follower: existingMuter, error: {message: 'The hub is already muted by the user'}});
      }
      var muter = new Muter({
        hub: hubId,
        user: userId
      });
      muter.save(function(err) {
        if (err) {
          return next(new Error('Can not save muter!'));
        }
        Muter.populate(muter, {path: 'hub user'}, function(err, populatedMuter) {
          if (err) {
            return next(new Error('Can not mute the hub!'));
          }
          res.send({muter: populatedMuter, message: 'Hub has been muted'});
        });
      });
    });
  });

  /**
   * DELETE /api/hub/:hubId/muter/:userId
   * User unmute a hub
   */
  app.delete('/api/hub/:hubId/muter/:userId', ensureAuthenticated, function(req, res, next) {
    var hubId = req.params.hubId;
    var userId = req.params.userId;
    Muter.findOneAndRemove({hub: hubId, user: userId}).exec(function(err) {
      if (err) {
        return next(new Error('Can not unmute the hub!'));
      }
      res.send({muter: null, message: 'Hub has been unmuted'});
    });
  });
};
