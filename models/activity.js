var mongoose = require('mongoose');

var activitySchema = new mongoose.Schema({
  title: String,
  description: String,
  hub: {type: mongoose.Schema.Types.ObjectId, ref: 'Hub'},
  event: {type: mongoose.Schema.Types.ObjectId, ref: 'Event'},
  business: {type: mongoose.Schema.Types.ObjectId, ref: 'Business_profile'},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  date_created: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Activity', activitySchema);
