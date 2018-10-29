var Attachment = require('../../models/attachment');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;

exports.configure = function(app, canAccess) {
  /**
   * POST /api/attachments
   * Creates attachment, uploads file to amazon
   */
  app.post('/api/attachments/:kind', ensureAuthenticated, function(req, res, next) {
    var item = new Attachment({
      name: req.files.file.originalname || req.files.file.name
    });
    item.attach('file', req.files.file, function(err) {
      if (err) {
        return next(new Error('Can not attach file!'));
      }
      item.save(function(err) {
        if (err) {
          return next(new Error('Can not save attachment!'));
        }
        res.send({data: item});
      });
    });
  });
};
