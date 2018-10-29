var Track = require('../../models/soundtrack');
var errorHandler = require('../errors');
var mongoose = require('mongoose');
var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {

  /**
   * GET /api/tracks
   * Get all soundtracks for the user & device
   */
  app.get('/api/tracks/currentuser', ensureAuthenticated, function(req, res, next) {
    console.log('currentUser: ', req.user);

    var userID = req.user;
    var dbQuery = {$and : [
      {created_by: mongoose.Types.ObjectId(userID)},
      {is_active: true}
    ]};

    Track.find(dbQuery).exec(function(err, tracks) {
      if (err) {
        return next(new Error(errorHandler.getErrorMessage(err)));
      }
      res.send({
        tracks: tracks
      });
    });

  });

  /**
   * GET /api/tracks/device
   * Get all soundtracks for the user stored on his device
   */
  app.get('/api/tracks/device', ensureAuthenticated, function(req, res, next) {
    var userID = req.query.userID;
    var deviceID = req.query.deviceID;
    Track.find({$and: [{created_by: mongoose.Types.ObjectId(userID)}, {device_id: deviceID}]})
      .exec(function(err, tracks) {
        if (err) {
          return next(new Error(errorHandler.getErrorMessage(err)));
        }
        res.send({
          tracks: tracks
        });
      });
  });

  /**
   * GET /api/tracks/other
   * Get all soundtracks for the user stored on his other devices
   */
  app.get('/api/tracks/other', ensureAuthenticated, function(req, res, next) {
    var userID = req.query.userID;
    var deviceID = req.query.deviceID;
    Track.find({created_by: userID, device_id: {$ne: deviceID}})
      .exec(function(err, tracks) {
        if (err) {
          return next(new Error(errorHandler.getErrorMessage(err)));
        }
        res.send({
          tracks: tracks
        });
      });
  });

  /**
   * GET /api/tracks/user
   * Get all soundtracks for the user stored on his all devices
   */
  app.get('/api/tracks/user', ensureAuthenticated, function(req, res, next) {
    var userID = req.query.userID;

    Track.find({created_by: mongoose.Types.ObjectId(userID)}).exec(function(err, tracks) {
      if (err) {
        return next(new Error(errorHandler.getErrorMessage(err)));
      }
      res.send({
        tracks: tracks
      });
    });
  });

  /**
   * GET /api/track
   * Get user track by mediaSrc
   */
  app.get('/api/track', ensureAuthenticated, function(req, res, next) {
    var path = req.query.path;
    var userID = req.query.user;
    Track.findOne({path: path, created_by: userID}).exec(function(err, track) {
      if (err) {
        return next(new Error(errorHandler.getErrorMessage(err)));
      }
      res.send({
        track: track
      });
    });
  });

  /**
   * PUT /api/tracks/:id/toggle
   * Activate/deactivate soundtrack
   */
  app.put('/api/tracks/:id/toggle', ensureAuthenticated, canAccess.if_admin, function(req, res, next) {
    Track.update({id: req.params.id},
      {
        $set: {
          'is_active': req.body.is_active,
          'date_modified': new Date()
        }
      }, function(err) {
        if (err) {
          return next(new Error(errorHandler.getErrorMessage(err)));
        }
        var msg = req.body.is_active ? 'track activated' : 'track deactivated';
        res.send({message: msg});
      });
  });

  /**
   * POST /api/tracks/:id
   * Create or update a track by Id
   */
  app.post('/api/tracks/:id', ensureAuthenticated, function(req, res, next) {
    var markers = req.body.markers;
    var filename = req.body.filename;
    var path = req.body.path;
    var duration = req.body.duration;
    var device = req.body.device;

    var trackId = req.params.id;
    if (trackId !== 'undefined') {
      Track.findById(trackId, function(err, track) {
        if (err) {
          return next(new Error(errorHandler.getErrorMessage(err)));
        }
        track.markers = markers;
        track.date_modified = new Date();
        track.save(function(err) {
          if (err) {
            return next(new Error(errorHandler.getErrorMessage(err)));
          }
          res.send({
            track: track
          });
        });
      })
    } else {
      var newTrack = new Track({
        filename: filename,
        path: path,
        markers: markers,
        created_by: req.user,
        duration: duration,
        device: device,
        device_id: device.id
      });
      newTrack.save(function(err) {
        if (err) {
          return next(new Error(errorHandler.getErrorMessage(err)));
        }
        res.send({
          track: newTrack
        });
      });
    }
  });

  /**
   * PUT /api/tracks/:id/name
   * Update track name
   */
  app.put('/api/tracks/:id/name', ensureAuthenticated, function(req, res, next) {
    Track.findByIdAndUpdate(req.params.id,
      {
        $set: {
          'filename': req.body.filename,
          'date_modified': new Date()
        }
      }, {
        //http://mongoosejs.com/docs/api.html#model_Model.findOneAndUpdate
        //true to return the modified document rather than the original
        new: true
      }, function(err, track) {
        if (err) {
          return next(new Error(errorHandler.getErrorMessage(err)));
        }
        res.send({track: track, message: 'Soundtrack name updated.'});
      });
  });

  /**
   * PUT /api/tracks/:id
   * Update track by id
   */
  app.put('/api/tracks/:id', ensureAuthenticated, function(req, res, next) {

    Track.findByIdAndUpdate(req.params.id,
      {
        $set: {
          'filename': req.body.filename,
          'duration': req.body.duration,
          'path': req.body.path,
          'device': req.body.deviceInfo,
          'device_id': req.body.deviceInfo.id,
          'date_modified': new Date()
        }
      }, {
        //http://mongoosejs.com/docs/api.html#model_Model.findOneAndUpdate
        //true to return the modified document rather than the original
        new: true
      }, function(err, track) {
        if (err) {
          return next(new Error(errorHandler.getErrorMessage(err)));
        }
        res.send({track: track, message: 'Soundtrack updated.'});
      });
  });

};
