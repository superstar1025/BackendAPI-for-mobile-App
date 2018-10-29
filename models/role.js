var mongoose = require('mongoose');

var roleSchema = new mongoose.Schema({
  name: {type: String, unique: true, lowercase: true},
  description: {type: String},
  is_active: {type: Boolean, default: true}
});

module.exports = mongoose.model('Role', roleSchema);
