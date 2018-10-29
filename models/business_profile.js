var mongoose = require('mongoose');

var businessProfile = new mongoose.Schema({
  name: String,
  address: String,
  description: String,
  location: {
    display_name: String,
    lat: Number,
    lng: Number
  },
  email: String,
  phone: String,
  primary_category: {type: mongoose.Schema.Types.ObjectId, ref: 'Business_category'},
  secondary_category: {type: mongoose.Schema.Types.ObjectId, ref: 'Business_category'},
  tertiary_category: {type: mongoose.Schema.Types.ObjectId, ref: 'Business_category'},
  logo: {type: mongoose.Schema.Types.ObjectId, ref: 'Attachment'},
  cover_image: {type: mongoose.Schema.Types.ObjectId, ref: 'Attachment'},
  is_active: {type: Boolean, default: true},
  email_settings: [{type: String, default: ''}],
  website: String,
  social_accounts: [{
    type: String,
    username: String
  }],
  date_created: {type: Date, default: Date.now},
  date_modified: {type: Date, default: Date.now},
  recommendations: [{type: mongoose.Schema.Types.ObjectId, ref: 'Business_profile'}],
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  events_count: {type: Number, default: 0}
});

module.exports = mongoose.model('Business_profile', businessProfile);
