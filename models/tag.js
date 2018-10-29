var mongoose = require('mongoose');

var tagSchema = new mongoose.Schema({
  name: String,
  is_active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Tag', tagSchema);
