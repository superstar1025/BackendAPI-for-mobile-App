var mongoose = require('mongoose');

var category = new mongoose.Schema({
  name: String,
  type: Number, // 1 - primary, 2 - secondary, 3 - tertiary
  parent_category: {type: mongoose.Schema.Types.ObjectId, ref: 'Business_category', default: null}
});

module.exports = mongoose.model('Business_category', category);
