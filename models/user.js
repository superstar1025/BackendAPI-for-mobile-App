var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var mongoose = require('mongoose');
var friends = require('mongoose-friends');

var userSchema = new mongoose.Schema({
  email: String,
  password: String,
  facebook: String,
  google: String,
  name: {type: String, default: ''},
  gender: {type: String, default: ''},
  location: {
    display_name: String,
    lat: Number,
    lng: Number
  },
  website: {type: String, default: ''},
  picture: {type: String, default: ''},
  role: {type: mongoose.Schema.Types.ObjectId, ref: 'Role'},
  date_created: {type: Date, default: Date.now},
  date_modified: {type: Date, default: Date.now},
  is_active: {type: Boolean, default: true},
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  is_public: {type: Boolean, default: true},
  phoneNo: String
});

/**
 * Password hash middleware.
 */
userSchema.pre('save', function(next) {
  var _this = this;
  if (!_this.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(5, function(err, salt) {
    if (err) {
      return next(err);
    }
    bcrypt.hash(_this.password, salt, null, function(err, hash) {
      if (err) {
        return next(err);
      }
      _this.password = hash;
      next();
    });
  });
});

/**
 * Helper method for validationg user's password.
 */
userSchema.methods.comparePassword = function(candidatePassword, cb) {
  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
    if (err) {
      return cb(err);
    }
    cb(null, isMatch);
  });
};

/**
 * Helper method for getting user's gravatar.
 */
userSchema.methods.gravatar = function(size) {
  if (!size) {
    size = 200;
  }
  if (!this.email) {
    return 'https://gravatar.com/avatar/?s=' + size + '&d=retro';
  }
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
};

userSchema.plugin(friends());

module.exports = mongoose.model('User', userSchema);
