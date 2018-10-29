var mongoose = require('mongoose');

var hubSchema = new mongoose.Schema({
  name: {type: String, trim: true},
  description: {type: String, trim: true},
  is_active: {type: Boolean, default: true},
  start_datetime: {type: Date, default: Date.now},
  end_datetime: {type: Date, default: Date.now},
  events_count: {type: Number, default: 0},
  date_created: {type: Date, default: Date.now},
  date_modified: {type: Date, default: Date.now},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Hub', hubSchema);
