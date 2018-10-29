var Type = require('../../models/event_type');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {
  /**
   * GET /api/event-types
   * Get all event types.
   */
  app.get('/api/event-types', ensureAuthenticated, function(req, res, next) {
    Type.count({}, function(err, count) {
      if (err) {
        return next(new Error('Can not count event types!'));
      }
      var query = req.query;
      Type.find().skip((query.page - 1) * query.size).limit(query.size).exec(function(err, types) {
        if (err) {
          return next(new Error('Can not get event types!'));
        }
        res.send({
          types: types,
          total: count
        });
      });
    });
  });

  /**
   * POST /api/event-types/:id/toggle
   * Activate/deactivate event-type
   */
  app.put('/api/event-types/:id/toggle', ensureAuthenticated, canAccess.if_admin, function(req, res, next) {
    Type.update({_id: req.params.id}, {$set: {'is_active': req.body.is_active}}, function(err) {
      if (err) {
        return next(new Error('Can not update the event type!'));
      }
      var msg = req.body.is_active ? 'Event type activated' : 'Event type deactivated';
      res.send({message: msg});
    });
  });

  /**
   * POST /api/event-types
   * Add new event type
   */
  app.post('/api/event-types', ensureAuthenticated, canAccess.if_admin, function(req, res, next) {
    var desc = req.body.description.capitalize();
    var type = req.body.description.split(' ').join('_');

    var eventType = new Type({
      type: type,
      description: desc
    });

    Type.findOne({name: name}, function(err, existingType) {
      if (err) {
        return next(new Error('Can not check if the event type exists!'));
      }
      if (existingType) {
        return res.json({event_type: null, error: {message: 'Event type already exists.'}});
      }
      eventType.save(function(err) {
        if (err) {
          return next(new Error('Can not save event type!'));
        }
        res.send({event_type: eventType, message: 'Event type has been saved'})
      });
    });
  });

};
