var fs = require('fs');
var path = require('path');
var User = require('../../models/user');
var Role = require('../../models/role');
var batmanConf = require('../../config/batman');
var async = require('async');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {

  /**
   * GET /api/users
   * Get all users by role (paginated).
   */
  app.get('/api/users', ensureAuthenticated, function(req, res) {
    var query = req.query;

    if (!query.filter) {
      query.filter = '';
    }

    if (!query.role || query.role === 'super_user') {
      User.count({email: {'$ne': batmanConf.email}}, function(err, count) {
        if (err) {
          throw err;
        }
        User.find({email: {'$ne': batmanConf.email}, name: {'$regex': query.filter, '$options': 'i'}})
          .sort(query.sort)
          .populate('role')
          .skip((query.page - 1) * query.size)
          .limit(query.size)
          .exec(function(err, users) {
            res.send({
              users: users,
              total: count
            });
          });
      });
    } else {
      Role.findOne({name: query.role}).exec(function(err, role) {
        if (err) {
          throw err;
        }
        User.count({role: role._id}, function(err, count) {
          if (err) {
            throw err;
          }
          User.find({role: role._id, name: {'$regex': query.filter, '$options': 'i'}})
            .sort(query.sort)
            .populate('role')
            .skip((query.page - 1) * query.size)
            .limit(query.size)
            .exec(function(err, users) {
              res.send({
                users: users,
                total: count
              });
            });
        });
      });
    }
  });

  /**
   * GET /api/users/roles
   * Get total number of users by roles
   */
  app.get('/api/users/roles', ensureAuthenticated, canAccess.if_admin_or_business_provider,
    function(req, res) {
      var usersByRoles = [];

      var handler = function(aRole, cb) {
        User.find({role: aRole._id}).exec(function(err, users) {
          if (err) {
            cb(err);
          } else {
            usersByRoles.push({
              role: aRole,
              users: users.length
            });
            cb();
          }
        });
      };

      var finalCallback = function(err) {
        if (err) {
          return res.send({data: null, error: {message: 'Unable to get data from the server.'}});
        }
        res.send({data: usersByRoles});
      };

      Role.find({name: {'$ne': 'super_user'}}).exec(function(err, roles) {
        if (err) {
          throw err;
        }
        async.each(roles, handler, finalCallback);
      });
    });

  /**
   * PUT /api/users/:id
   * Update user role
   */
  app.put('/api/users/:id', ensureAuthenticated, canAccess.if_admin, function(req, res) {
    User.update({_id: req.params.id}, {$set: {'role': req.body.role._id, 'date_modified': new Date()}}, function(err) {
      if (err) {
        throw err;
      }
      res.send({message: 'User role updated'});
    });
  });

  /**
   * GET /api/users/:id
   * Get user by id
   */
  app.get('/api/users/:id', function(req, res, next) {
    var id = req.params.id;
    User.findById(id).exec(function(err, user) {
      if (err) {
        throw err;
      }
      res.send({data: user});
    });
  });

  /**
   * POST /api/users/:id
   * Update user profile
   */
  app.post('/api/users/:id', ensureAuthenticated, function(req, res, next) {

    var id = req.params.id;

    if (id != req.user._id &&
      (req.user.role.name === 'application_user' || req.user.role.name === 'business_provider')) {
      return res.send(403, {
        error: {
          message: 'User is not authorized to perform the request.'
        }
      });
    }

    if (!req.body.email || req.body.email.length === 0) {
      return res.json({error: {message: 'Email is empty.'}});
    }

    User.findById(id).populate('role').exec(function(err, user) {

      if (err) {
        throw err;
      }

      User.findOne({email: {$regex: new RegExp(req.body.email, 'i')}}, function(err, existingUser) {
        if (existingUser && existingUser.id !== user.id) {
          return res.json({error: {message: 'Account with that email address already exists.'}});
        }
        user.email = req.body.email;
        user.name = req.body.name || '';
        user.gender = req.body.gender || '';
        user.location = req.body.location || '';
        user.website = req.body.website || '';
        user.date_modified = new Date();

        user.save(function(err) {
          if (err) {
            throw err;
          }
          res.json({user: user});
        });
      });
    });
  });

  /**
   * POST /api/users/:id/password
   * Update user password
   */
  app.post('/api/users/:id/password', ensureAuthenticated, function(req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
      return res.json({error: {message: 'Incorrect input data'}});
    }

    var id = req.params.id;

    User.findById(id).populate('role').exec(function(err, user) {
      if (err) {
        throw err;
      }

      user.password = req.body.password;

      user.save(function(err) {
        if (err) {
          throw err;
        }
        user.password = undefined;
        res.json({user: user});
      });
    });
  });

  /**
   * POST /api/users/:id/toggle
   * Activate/deactivate user account
   */
  app.put('/api/users/:id/toggle', ensureAuthenticated, canAccess.if_admin, function(req, res) {
    User.update({_id: req.params.id}, {$set: {'is_active': req.body.is_active, 'date_modified': new Date()}},
      function(err) {
        if (err) {
          throw err;
        }
        var msg = req.body.is_active ? 'Account activated' : 'Account deactivated';
        res.send({message: msg});
      });
  });

  /**
   * POST /api/users
   * Add new user
   */
  app.post('/api/users', ensureAuthenticated, canAccess.if_admin, function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('name', 'Name is required').len(1);
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
    var errors = req.validationErrors();

    if (errors) {
      return res.json({user: null, error: {message: 'Invalid credentials'}});
    }

    var user = new User({
      email: req.body.email,
      password: req.body.password,
      name: req.body.name,
      role: req.body.role._id
    });

    User.findOne({email: {$regex: new RegExp(req.body.email, 'i')}}, function(err, existingUser) {
      if (existingUser) {
        return res.json({user: null, error: {message: 'Account with that email address already exists.'}});
      }
      user.save(function(err) {
        if (err) {
          throw err;
        }
        res.send({user: user, message: 'User has been saved'})
      });
    });
  });
};
