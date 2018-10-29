var mongoose = require('mongoose');

var soundTrackSchema = new mongoose.Schema({
  filename: String,
  duration: Number,
  path: String,
  markers: [{type: Number, unique: 'The marker value is not unique'}],
  device_id: String,
  device:   mongoose.Schema.Types.Mixed,
  date_created: {type: Date, default: Date.now},
  date_modified: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Soundtrack', soundTrackSchema);
