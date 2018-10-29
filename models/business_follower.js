var mongoose = require('mongoose');

var follower = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  business: {type: mongoose.Schema.Types.ObjectId, ref: 'Business_profile'},
  date_followed: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Business_follower', follower);
