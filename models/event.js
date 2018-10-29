var mongoose = require('mongoose');

var eventSchema = new mongoose.Schema({
  name: String,
  description: {type: String, default: ''},
  location: {
    display_name: String,
    lat: Number,
    lng: Number
  },
  type: {type: mongoose.Schema.Types.ObjectId, ref: 'Event_type'},
  start_datetime: Date,
  end_datetime: Date,
  date_created: {type: Date, default: Date.now},
  date_modified: {type: Date, default: Date.now},
  hubs: [{type: mongoose.Schema.Types.ObjectId, ref: 'Hub'}],
  is_public: {type: Boolean, default: true},
  created_by: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  tags: [{type: mongoose.Schema.Types.ObjectId, ref: 'Tag'}],
  attachments_allowed: {type: Boolean, default: false},
  comments_allowed: {type: Boolean, default: false},
  is_draft: {type: Boolean, default: false},
  is_active: {type: Boolean, default: true},
  image: {type: mongoose.Schema.Types.ObjectId, ref: 'Attachment'},

  users_attending: {type: String, default: ''},
  external_link: [{type: String, default: ''}],
  attachment_url: {type: String, default: ''},
  language: {
    primary: {type: String, default: 'en'},
    secondary: {type: String, default: 'en'}
  },
  shared_with: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  fee: {type: Number, default: 0},
  admin_users: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
  announcements: {type: String, default: ''},
  business: {type: mongoose.Schema.Types.ObjectId, ref: 'Business_profile'},
  archived: {type: Boolean, default: false}

});

module.exports = mongoose.model('Event', eventSchema);
