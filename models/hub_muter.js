var mongoose = require('mongoose');

var muter = new mongoose.Schema({
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  hub: {type: mongoose.Schema.Types.ObjectId, ref: 'Hub'},
  date_muted: {type: Date, default: Date.now}
});

module.exports = mongoose.model('Hub_muter', muter);
