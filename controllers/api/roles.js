var Role = require('../../models/role');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

exports.configure = function(app, canAccess) {
  /**
   * GET /api/roles
   * Get all roles.
   */
  app.get('/api/roles', ensureAuthenticated, canAccess.if_admin, function(req, res, next) {
    var query = req.query;
    if (!query.filter) {
      query.filter = '';
    }

    Role.count({name: {'$ne': 'super_user'}}, function(err, count) {
      if (err) {
        return next(new Error('Can not count roles!'));
      }

      Role.find({name: {'$ne': 'super_user'}, description: {'$regex': query.filter, '$options': 'i'}})
        .skip((query.page - 1) * query.size)
        .limit(query.size)
        .exec(function(err, roles) {
          if (err) {
            return next(new Error('Can not get roles!'));
          }
          res.send({
            data: roles,
            total: count
          });
        });
    });
  });

  /**
   * POST /api/roles/:id/toggle
   * Activate/deactivate role
   */
  app.put('/api/roles/:id/toggle', ensureAuthenticated, canAccess.if_admin, function(req, res, next) {
    Role.update({_id: req.params.id}, {$set: {'is_active': req.body.is_active}}, function(err) {
      if (err) {
        return next(new Error('Can not update role!'));
      }
      var msg = req.body.is_active ? 'Role activated' : 'Role deactivated';
      res.send({message: msg});
    });
  });

  /**
   * POST /api/roles
   * Add new role
   */
  app.post('/api/roles', ensureAuthenticated, canAccess.if_admin, function(req, res, next) {
    var desc = req.body.description.capitalize();
    var name = req.body.description.split(' ').join('_');

    var role = new Role({
      name: name,
      description: desc
    });

    Role.findOne({name: name}, function(err, existingRole) {
      if (err) {
        return next(new Error('Can not check if role exists!'));
      }
      if (existingRole) {
        return res.json({role: null, error: {message: 'Role already exists.'}});
      }
      role.save(function(err) {
        if (err) {
          return next(new Error('Can not save role!'));
        }
        res.send({role: role, message: 'Role has been saved'})
      });
    });
  });
};
