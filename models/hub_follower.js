var mongoose = require('mongoose');

var follower = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  hub: {type: mongoose.Schema.Types.ObjectId, ref: 'Hub'},
  date_followed: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Hub_follower', follower);
