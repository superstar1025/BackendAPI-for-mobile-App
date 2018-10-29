var Hub = require('../../models/hub');
var activityCb = require('../utils/activityCb');
var async = require('async');
var hubsWaterfall = require('../utils/hubsWaterfall');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {
  /**
   * GET /api/hubs/top/:number
   * Get top hubs.
   */
  app.get('/api/hubs/top/:number', function(req, res, next) {
    var count = req.params.number;
    Hub.find().sort('-events_count').limit(count).exec(function(err, hubs) {
      if (err) {
        return next(new Error('Can not get top hubs!'));
      }
      res.send({hubs: hubs});
    });
  })

  /**
   * GET /api/hubs
   * Get all interest groups.
   */
  app.get('/api/hubs', ensureAuthenticated, function(req, res, next) {

    var query = req.query || {
        page: 1,
        size: null
      };
    if (!query.name) {
      query.name = '';
    }

    /*if (hubType !== 'all') {
     query.page = 1;
     query.size = null;
     }*/

    var hubType = query.filter || 'all';
    var hubTypeFilter = {name: {'$regex': query.name, '$options': 'i'}};

    switch (hubType) {
      case 'my':
        hubTypeFilter.created_by = req.user;
        break;
      case 'new': //created within last 5 days
        var cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 5);
        hubTypeFilter = {date_created: {$gt: cutoff}};
        break;
      default:
        hubTypeFilter = {name: {'$regex': query.name, '$options': 'i'}};
    }

    Hub.count({}, function(err, count) {
      if (err) {
        return next(new Error('Can not count hubs!'));
      }

      var hubsMethods = hubsWaterfall(query, req.user, hubType, hubTypeFilter);

      async.waterfall([
        hubsMethods.getHubs,
        hubsMethods.addFollowingFlag,
        hubsMethods.addMutedFlag
      ], function(err, result) {
        if (err) {
          return next(new Error('Can not get hubs!'));
        }
        res.send({
          hubs: result,
          total: count
        });
      });
    });

  });

  /**
   * GET /api/hubs/:id
   * Get hub by id
   */
  app.get('/api/hubs/:id', ensureAuthenticated, function(req, res, next) {
    Hub.findOne({_id: req.params.id}).populate('created_by').exec(function(err, hub) {
      if (err) {
        return next(new Error('Can not get hub!'));
      }
      res.send({
        hub: hub
      });
    });
  });

  /**
   * POST /api/hubs/:id
   * Update hub
   */
  app.post('/api/hubs/update/:id', ensureAuthenticated, function(req, res, next) {
    Hub.findOne({name: req.body.name}, function(err, existingHub) {
      if (err) {
        return next(new Error('Can not check if the hub exists!'));
      }
      if (existingHub && existingHub._id != req.params.id) {
        return res.json({hub: null, error: {message: 'Hub with that name already exists.'}});
      }
      Hub.update({_id: req.params.id},
        {
          $set: {
            'name': req.body.name,
            'description': req.body.name,
            'date_modified': new Date(),
            'start_datetime': req.body.start_datetime,
            'end_datetime': req.body.end_datetime
          }
        },
        function(err) {
          if (err) {
            return next(new Error('Can not update hub!'));
          }
          res.send({message: 'Hub has been updated successfully'});
        });
    });
  });

  /**
   * POST /api/hubs/:id/toggle
   * Activate/deactivate interest group
   */
  app.put('/api/hubs/:id/toggle', ensureAuthenticated, canAccess.if_admin, function(req, res, next) {
    Hub.update({_id: req.params.id}, {$set: {'is_active': req.body.is_active, date_modified: new Date()}},
      function(err) {
        if (err) {
          return next(new Error('Can not update hub!'));
        }
        var msg = req.body.is_active ? 'Hub activated' : 'Hub deactivated';
        res.send({message: msg});
      });
  });

  /**
   * POST /api/hubs
   * Add new interest group
   */
  app.post('/api/hubs', ensureAuthenticated, function(req, res, next) {

    Hub.findOne({name: req.body.name}, function(err, existingHub) {
      if (err) {
        return next(new Error('Can not check if hub exists!'));
      }
      if (existingHub) {
        return res.json({hub: null, error: {message: 'Hub with that name already exists.'}});
      }

      var hub = new Hub({
        name: req.body.name,
        description: req.body.name,
        created_by: req.user,
        start_datetime: req.body.start_datetime,
        end_datetime: req.body.end_datetime
      });

      hub.save(function(err) {
        if (err) {
          return next(new Error('Can not save hub!'));
        }
        activityCb(req.user._id, hub._id, 'hub', function(err) {
          if (err) {
            return next(new Error('Can not create an activity!'));
          }
          res.send({hub: hub, message: 'Hub has been saved'});
        });
      });
    });
  });
};
