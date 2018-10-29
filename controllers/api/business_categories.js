var BusinessCategory = require('../../models/business_category');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {

  /**
   * GET /api/business_categories/:id
   * Get business categories.
   */
  app.get('/api/business_categories/:id', ensureAuthenticated, canAccess.if_admin_or_business_provider,
    function(req, res, next) {
      var id = req.params.id;
      var query = req.query;
      if (id !== 'primary') {
        BusinessCategory.find({parent_category: id}).sort(query.sort).exec(function(err, categories) {
          if (err) {
            return next(new Error('Can not get business categories!'));
          }
          res.send(categories);
        });
      } else {
        BusinessCategory.find({parent_category: null}).sort(query.sort).exec(function(err, categories) {
          if (err) {
            return next(new Error('Can not get primary business categories!'));
          }
          res.send(categories);
        });
      }
    });
};
