var Event = require('../../models/event');
var BusinessProfile = require('../../models/business_profile');
var Hub = require('../../models/hub');
var Attachment = require('../../models/attachment');
var activityCb = require('../utils/activityCb');
var _ = require('lodash');
var async = require('async');
var IDs = require('../utils/objectIDs');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {

  /**
   * GET /api/events
   * Get all events
   */
  app.get('/api/events', function(req, res, next) {

    Event.count({}, function(err, count) {
      if (err) {
        return next(new Error('Can not count events!'));
      }
      var query = req.query;
      var start = new Date(req.query.date);
      start.setHours(0, 0, 0, 0);
      var end = new Date(req.query.date);
      end.setHours(23, 59, 59);

      var eventType = query.filter;
      var eventTypeFilter = null;
      switch (eventType) {
        case 'all':
          eventTypeFilter = null;
          break;
        case 'my':
          eventTypeFilter = {created_by: req.user};
          break;
        case 'archived':
          eventTypeFilter = {archived: true};
          break;
        default:
          eventTypeFilter = null;
      }

      var eventDateTimeFilters = [{
        //1 day event
        start_datetime: {$gte: start}, end_datetime: {$lte: end}
      }, {
        // starts before the date specified && ends after the date specified
        start_datetime: {$lte: start}, end_datetime: {$gte: end}
      }, {
        // starts on the date specified && ends after the date specified
        start_datetime: {$gte: start, $lte: end}, end_datetime: {$gte: end}
      }, {
        // starts before the date specified && ends on the date specified
        start_datetime: {$lte: start}, end_datetime: {$gte: start, $lte: end}
      }];

      Event.find(eventTypeFilter).or(eventDateTimeFilters)
        .populate('type hubs tags image')
        .skip((query.page - 1) * query.size)
        .limit(query.size)
        .exec(function(err, events) {
          if (err) {
            return next(new Error('Can not find events!'));
          }
          res.send({
            events: events,
            total: count
          });
        });
    });
  });

  /**
   * GET /api/events/:id
   * Get event by id
   */
  app.get('/api/events/:id', function(req, res, next) {
    var id = req.params.id;
    Event.findById(id).populate('type hubs tags image business created_by').exec(function(err, event) {
      if (err) {
        return next(new Error('Can not find the event!'));
      }
      var businessId = event.business ? event.business._id : null;
      BusinessProfile.findById(businessId).populate('created_by').exec(function(err, profile) {
        if (err) {
          return next(new Error('Can not find the business associated with the event!'));
        }
        var provider = profile ? profile.created_by : null;
        res.send({
          event: event,
          business_provider: provider
        });
      });
    });
  });

  /**
   * POST /api/events/:id/toggle
   * Activate/deactivate event
   */
  app.put('/api/events/:id/toggle', ensureAuthenticated, canAccess.if_admin, function(req, res) {
    Event.update({_id: req.params.id}, {$set: {'is_active': req.body.is_active}}, function(err) {
      if (err) {
        return next(new Error('Can not update event!'));
      }
      var msg = req.body.is_active ? 'Event activated' : 'Event deactivated';
      res.send({message: msg});
    });
  });

  /**
   * POST /api/events
   * Add new event
   */
  app.post('/api/events', ensureAuthenticated, function(req, res, next) {
    var event = req.body;
    event.hubs = _.pluck(event.hubs, '_id');

    if (event.hubs.length > 0) {
      async.each(event.hubs, function(id, cb) {
        Hub.update({_id: id}, {$inc: {'events_count': 1}}, function(err) {
          cb(err);
        })
      }, function(err) {
        if (err) {
          return next(new Error('Unable to update hubs. Event has not been saved!'));
        }
      });
    }
    event.tags = _.pluck(event.tags, '_id');
    event.type = event.type._id;
    event.admin_users = [];
    if (event.image) {
      event.image = event.image._id;
    };
    if (event.business) {
      BusinessProfile.update({_id: event.business._id}, {$inc: {'events_count': 1}}, function(err) {
        if (err) {
          return next(new Error('Unable to update business profile. Event has not been saved!'));
        }
      });
      event.business = event.business._id;
    };

    event.created_by = req.user;

    var eventModel = new Event(event);
    eventModel.save(function(err) {
      if (err) {
        return next(new Error('Can not save event!'));
      }
      activityCb(req.user._id, eventModel._id, 'event', function(err) {
        if (err) {
          return next(new Error('Can not create an activity!'));
        }
        res.send({event: event, message: 'Event has been saved'})
      });
    });
  });

  /**
   * POST /api/events/:id
   * Update event
   */
  app.post('/api/events/:id', ensureAuthenticated, function(req, res, next) {

    var id = req.params.id;
    var _event = req.body;

    Event.findById(id, function(err, event) {
      if (err) {
        return next(new Error('Can not get event!'));
      }
      _event.hubs = _.pluck(_event.hubs, '_id');
      var newHubs = _.difference(_event.hubs, IDs.IDsToStrings(event.hubs));
      if (newHubs.length > 0) {
        async.each(newHubs, function(id, cb) {
          Hub.update({_id: id}, {$inc: {'events_count': 1}}, function(err) {
            cb(err);
          })
        }, function(err) {
          if (err) {
            return next(new Error('Unable to update hubs. Event has not been saved!'));
          }
        });
      }

      var oldHubs = _.difference(IDs.IDsToStrings(event.hubs), _event.hubs);
      if (oldHubs.length > 0) {
        async.each(oldHubs, function(id, cb) {
          Hub.update({_id: id}, {$inc: {'events_count': -1}}, function(err) {
            cb(err);
          })
        }, function(err) {
          if (err) {
            return next(new Error('Unable to update hubs. Event has not been saved!'));
          }
        });
      }
      _event.tags = _.pluck(_event.tags, '_id');
      _event.type = _event.type._id;
      _event.admin_users = [];
      if (_event.image) {
        _event.image = _event.image._id;
      };

      if (_event.business) {
        BusinessProfile.update({_id: _event.business._id}, {$inc: {'events_count': 1}}, function(err) {
          if (err) {
            return next(new Error('Unable to update business profile. Event has not been saved!'));
          }
        });
        _event.business = _event.business._id;
        if (_event.business !== event.business.toString()) {
          BusinessProfile.update({_id: event.business}, {$inc: {'events_count': -1}}, function(err) {
            if (err) {
              return next(new Error('Unable to update business profile. Event has not been saved!'));
            }
          });
        }
      };
      _event.created_by = req.user;
      delete _event._id;
      Event.update({_id: id}, _event, function(err, updatedEvent) {
        if (err) {
          return next(new Error('Can not save event!'));
        }
        return res.send({event: updatedEvent, message: 'Event has been saved'});
      });
    });
  });
};
