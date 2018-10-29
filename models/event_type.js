var mongoose = require('mongoose');

var typeSchema = new mongoose.Schema({
  type: String,
  description: String,
  is_active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Event_type', typeSchema);
