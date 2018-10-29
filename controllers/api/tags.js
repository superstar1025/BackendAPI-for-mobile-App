var Tag = require('../../models/tag');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {
  /**
   * GET /api/tags
   * Get all tags
   */
  app.get('/api/tags', ensureAuthenticated, function(req, res, next) {
    var query = req.query;
    if (!query.filter) {
      query.filter = '';
    }

    Tag.count({}, function(err, count) {
      if (err) {
        return next(new Error('Can not count tags!'));
      }

      Tag.find({name: {'$regex': query.filter, '$options': 'i'}})
        .skip((query.page - 1) * query.size)
        .limit(query.size)
        .exec(function(err, tags) {
          if (err) {
            return next(new Error('Can not get tags!'));
          }
          res.send({
            tags: tags,
            total: count
          });
        });
    });
  });

  /**
   * POST /api/tags/:id/toggle
   * Activate/deactivate tag
   */
  app.put('/api/tags/:id/toggle', ensureAuthenticated, canAccess.if_admin, function(req, res, next) {
    Tag.update({_id: req.params.id}, {$set: {'is_active': req.body.is_active}}, function(err) {
      if (err) {
        return next(new Error('Can not update tag!'));
      }
      var msg = req.body.is_active ? 'Tag activated' : 'Tag deactivated';
      res.send({message: msg});
    });
  });

  /**
   * POST /api/tags
   * Add new tag
   */
  app.post('/api/tags', ensureAuthenticated, function(req, res, next) {
    var name = req.body.name;

    var tag = new Tag({
      name: name
    });

    Tag.findOne({name: name}, function(err, existingTag) {
      if (err) {
        return next(new Error('Can not check if tag exists!'));
      }
      if (existingTag) {
        return res.json({interest_group: null, error: {message: 'Tag already exists.'}});
      }
      tag.save(function(err) {
        if (err) {
          return next(new Error('Can not save tags!'));
        }
        res.send({tag: tag, message: 'Tag has been saved'})
      });
    });
  });
};
