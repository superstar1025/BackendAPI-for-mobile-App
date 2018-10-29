var fs = require('fs');
var path = require('path');
var User = require('../../models/user');
var BusinessProfile = require('../../models/business_profile');
var Event = require('../../models/event');
var Follower = require('../../models/business_follower');
var Attachment = require('../../models/attachment');
var async = require('async');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {

  /**
   * GET /api/business_profiles/top/:number
   * Get top businesses.
   */
  app.get('/api/business_profiles/top/:number', function(req, res, next) {
    var count = req.params.number;
    var topProfiles = [];
    BusinessProfile.find()
      .sort('-events_count')
      .populate('primary_category secondary_category tertiary_category')
      .limit(count)
      .exec(function(err, profiles) {
        if (err) {
          return next(new Error('Can not get top business profiles!'));
        }

        async.eachSeries(profiles, function(profile, cb) {
          Follower.count({business: profile._id}, function(err, count) {
            topProfiles.push({
              profile: profile,
              followers_count: count
            });
            cb(err);
          });
        }, function(err) {
          if (err) {
            return next(new Error('Can not get top business profiles!'));
          }
          res.send({profiles: topProfiles});
        });
      });
  });

  /**
   * GET /api/business_profiles/:id/events
   * Get events associated with the selected business profile.
   */
  app.get('/api/business_profiles/:id/events', function(req, res, next) {
    var id = req.params.id;
    var query = req.query;
    var params = {
      business: id
    };
    if (!req.user) {
      params.is_public = true;
    }

    Event.count(params).exec(function(err, count) {
      if (err) {
        return next(new Error('Can not count events!'));
      }
      Event.find(params).sort(query.sort).skip((query.page - 1) * query.size).limit(query.size)
        .exec(function(err, events) {
          if (err) {
            return next(new Error('Can not get events!'));
          }
          res.send({
            events: events,
            total: count
          });
        })
    });
  });

  /**
   * GET /api/business_profiles/:id
   * Get business profile by id
   */
  app.get('/api/business_profiles/:id', function(req, res, next) {
    var id = req.params.id;
    BusinessProfile.findById(id)
      .populate('logo cover_image primary_category secondary_category tertiary_category created_by')
      .exec(function(err, profile) {
        if (err) {
          return next(new Error('Can not get business profile!'));
        }
        res.send(profile);
      });
  });

  /**
   * GET /api/business_profiles
   * Get all business profiles.
   */
  app.get('/api/business_profiles', ensureAuthenticated, canAccess.if_admin_or_business_provider,
    function(req, res, next) {

      var query = req.query;
      if (!query.filter) {
        query.filter = '';
      }

      BusinessProfile.count({}, function(err, count) {
        if (err) {
          return next(new Error('Can not count business profiles!'));
        }
        BusinessProfile.find({name: {'$regex': query.filter, '$options': 'i'}})
          .sort(query.sort)
          .populate('logo cover_image')
          .skip((query.page - 1) * query.size)
          .limit(query.size)
          .exec(function(err, profiles) {
            if (err) {
              return next(new Error('Can not get business profiles!'));
            }
            res.send({
              profiles: profiles,
              total: count
            });
          });
      });
    });

  /**
   * GET /api/business_profiles/subscription
   * Get all business profiles and add to each profile 'is I subscribed' flag..
   */
  app.get('/api/business_profiles/subscription', ensureAuthenticated,
    function(req, res, next) {

      var query = req.query;
      if (!query.filter) {
        query.filter = '';
      }

      BusinessProfile.count({}, function(err, count) {
        if (err) {
          return next(new Error('Can not count business profiles!'));
        }
        BusinessProfile.find({name: {'$regex': query.filter, '$options': 'i'}})
          .sort(query.sort)
          .populate('logo cover_image')
          .skip((query.page - 1) * query.size)
          .limit(query.size)
          .exec(function(err, profiles) {

            var profilesWithSubscribedProperty = [];
            async.eachSeries(profiles, function(profile, cb) {
              var isISubscribed = false;
              Follower.findOne({business: profile.id, user: req.user}, function(err, existingFollower) {
                if (err) {
                  cb(err);
                }
                if (existingFollower) {
                  isISubscribed = true;
                }
                profilesWithSubscribedProperty.push({
                  profile: profile,
                  isISubscribed: isISubscribed
                });
                cb(err);
              })
            }, function(err) {
              if (err) {
                return next(new Error('Can not get business profiles!'));
              }
              res.send({
                profiles: profilesWithSubscribedProperty,
                total: count
              });
            });
          });
      });
    });

  /**
   * GET /api/business_profiles/user/:id
   * Get business profiles by user id
   */
  app.get('/api/business_profiles/user/:id', ensureAuthenticated, function(req, res, next) {
    var id = req.params.id;
    var query = req.query;
    if (!query.filter) {
      query.filter = '';
    }
    BusinessProfile.count({created_by: id}, function(err, count) {
      if (err) {
        return next(new Error('Can not count business profiles!'));
      }
      BusinessProfile.find({created_by: id, name: {'$regex': query.filter, '$options': 'i'}})
        .sort(query.sort)
        .skip((query.page - 1) * query.size)
        .limit(query.size)
        .populate('logo cover_image primary_category secondary_category tertiary_category')
        .exec(function(err, profiles) {
          if (err) {
            return next(new Error('Can not get business profiles!'));
          }
          res.send({
            profiles: profiles,
            total: count
          });
        });
    });
  });

  /**
   * PUT /api/business_profiles/:id/toggle
   * Activate/deactivate business profile
   */
  app.put('/api/business_profiles/:id/toggle', ensureAuthenticated, canAccess.if_admin,
    function(req, res, next) {
      BusinessProfile.update({_id: req.params.id}, {
          $set: {
            'is_active': req.body.is_active,
            'date_modified': new Date()
          }
        },
        function(err) {
          if (err) {
            return next(new Error('Can not update business profile!'));
          }
          var msg = req.body.is_active ? 'Business profile activated' : 'Business profile deactivated';
          res.send({message: msg});
        });
    });

  /**
   * POST /api/business_profiles/:id
   * Update business profile
   */
  app.post('/api/business_profiles/:id', ensureAuthenticated, canAccess.if_admin_or_business_provider,
    function(req, res, next) {
      var id = req.params.id;

      var getCurrentUserRole = function(cb) {
        User.findById(req.user).populate('role').exec(function(err, user) {
          if (err) {
            return cb(err);
          }
          if (user.role.name !== 'application_administrator' && user.role.name !== 'super_user') {
            cb(null, false);
          } else {
            cb(null, true);
          }
        });
      };

      var ifCurrentUserCanUpdateBusinessProfile = function(isAdmin, cb) {
        if (isAdmin) {
          cb(null)
        } else {
          BusinessProfile.findOne({created_by: req.user, id: id}).exec(function(err, profile) {
            if (err) {
              return cb(err);
            }
            if (!profile) {
              cb(true)
            } else {
              cb(null)
            }
          })
        }
      };

      async.waterfall([
        getCurrentUserRole,
        ifCurrentUserCanUpdateBusinessProfile
      ], function(err) {
        if (err) {
          return next(new Error('You can not update this business profile!'));
        } else {
          req.assert('email', 'Email is not valid').isEmail();
          req.assert('name', 'Name is required').len(1);
          var errors = req.validationErrors();
          if (errors) {
            return res.json({profile: null, error: {message: 'Invalid profile details provided'}});
          }

          var _profile = req.body;
          if (_profile.logo) {
            _profile.logo = _profile.logo._id;
          }
          if (_profile.cover_image) {
            _profile.cover_image = _profile.cover_image._id;
          }
          if (_profile.primary_category) {
            _profile.primary_category = _profile.primary_category._id;
          }
          if (_profile.secondary_category) {
            _profile.secondary_category = _profile.secondary_category._id;
          }
          if (_profile.tertiary_category) {
            _profile.tertiary_category = _profile.tertiary_category._id;
          }

          _profile.date_modified = new Date();

          BusinessProfile.findOneAndUpdate({_id: id}, _profile, function(err, profile) {
            if (err) {
              return next(new Error('Can not update business profile!'));
            }
            return res.send({profile: profile, message: 'Business profile has been saved'});
          });
        }
      });
    });

  /**
   * POST /api/business_profiles
   * Create new business profile
   */
  app.post('/api/business_profiles', ensureAuthenticated, canAccess.if_admin_or_business_provider,
    function(req, res, next) {
      req.assert('email', 'Email is not valid').isEmail();
      req.assert('name', 'Name is required').len(1);
      var errors = req.validationErrors();
      if (errors) {
        return res.json({profile: null, error: {message: 'Invalid profile details provided'}});
      }

      var _profile = req.body;
      if (_profile.logo) {
        _profile.logo = _profile.logo._id;
      }
      if (_profile.cover_image) {
        _profile.cover_image = _profile.cover_image._id;
      }
      if (_profile.primary_category) {
        _profile.primary_category = _profile.primary_category._id;
      }
      if (_profile.secondary_category) {
        _profile.secondary_category = _profile.secondary_category._id;
      }
      if (_profile.tertiary_category) {
        _profile.tertiary_category = _profile.tertiary_category._id;
      }

      _profile.created_by = _profile.created_by || req.user;

      var profile = new BusinessProfile(_profile);
      profile.save(function(err) {
        if (err) {
          return next(new Error('Can not create business profile!'));
        }
        res.send({profile: profile, message: 'Business profile has been saved'})
      });
    });

};
