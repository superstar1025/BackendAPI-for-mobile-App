var Activity = require('../../models/activity');

module.exports = function(userId, entryId, modelType, title, cb) {

  if (typeof title === 'function') {
    cb = title;
    title = null;
  }

  var activity = new Activity({
    created_by: userId,
    title: title || modelType + ' created'
  });
  activity[modelType] = entryId;
  activity.save(function(err) {
    cb(err);
  });
};
