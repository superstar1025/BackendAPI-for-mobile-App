var User = require('../../models/user');
var Role = require('../../models/role');
var config = require('../../config/secrets');
var request = require('request');
var qs = require('querystring');
var crypto = require('crypto');
var nodemailer = require('nodemailer');
var async = require('async');

var ensureAuthenticated = require('../utils/tokenUtils').ensureAuthenticated;
var ensureNotAuthenticated = require('../utils/tokenUtils').ensureNotAuthenticated;
var createToken = require('../utils/tokenUtils').createToken;

exports.configure = function(app) {

  app.get('/api/me', ensureAuthenticated, function(req, res, next) {
    User.findById(req.user).populate('role').exec(function(err, user) {
      if (user) {
        user.password = undefined;
      }
      res.send(user);
    });
  });

  /**
   * GET /reset/:token
   * Reset Password page.
   */
  app.get('/reset/:token', ensureNotAuthenticated, function(req, res, next) {
    User.findOne({resetPasswordToken: req.params.token})
      .where('resetPasswordExpires').gt(Date.now())
      .exec(function(err, user) {
        if (!user) {
          return res.render('password_reset_error', {
            title: 'Invalid reset token'
          });
        }
        res.render('password_reset', {
          title: 'Password Reset'
        });
      });
  });

  /**
   * POST /api/reset/:token
   * Process the reset password request.
   */
  app.post('/api/reset/:token', function(req, res, next) {
    req.assert('password', 'Password must be at least 4 characters long.').len(4);
    req.assert('confirm', 'Passwords must match.').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
      return res.send(400, {error: errors});
    }

    async.waterfall([
      function(done) {
        User
          .findOne({resetPasswordToken: req.params.token})
          .where('resetPasswordExpires').gt(Date.now())
          .exec(function(err, user) {
            if (!user) {
              return res.send(400, {error: {message: 'Password reset token is invalid or has expired'}});
            }

            user.password = req.body.password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              if (err) {
                return next(err);
              }
              done(err, user);
            });
          });
      },
      function(user, done) {
        var transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: config.gmail.user,
            pass: config.gmail.password
          }
        });
        var mailOptions = {
          from: config.gmail.user,
          to: user.email,
          subject: 'Your DancersQ password has been changed',
          text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
        };
        transporter.sendMail(mailOptions, function(err) {
          done(err);
        });
      }
    ], function(err) {
      if (err) {
        return next(err);
      }
      res.send({message: 'The password has been successfully changed'});
    });
  });

  app.post('/api/resetPassword', function(req, res, next) {
    var email = req.body.email;
    if (!email) {
      return res.send(400, {error: {message: 'Wrong email!'}});
    }

    async.waterfall([
      function(done) {
        crypto.randomBytes(16, function(err, buf) {
          var token = buf.toString('hex');
          done(err, token);
        });
      },
      function(token, done) {
        User.findOne({email: email, password: {$exists: true}}).exec(function(err, user) {
          if (!user) {
            return res.send(400, {error: {message: 'Wrong email!'}});
          }
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

          user.save(function(err) {
            done(err, token, user);
          });
        });
      },
      function(token, user, done) {
        var transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: config.gmail.user,
            pass: config.gmail.password
          }
        });
        var mailOptions = {
          from: config.gmail.user,
          to: email,
          subject: 'Reset your password on DancersQ',
          text: 'You are receiving this email because you (or someone else) have requested the reset of the password' +
          ' for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
        };
        transporter.sendMail(mailOptions, function(err) {
          done(err, 'done');
        });
      }
    ], function(err) {
      if (err) {
        return next(err);
      }
      res.send({message: 'An e-mail has been sent to ' + email + ' with further instructions.'});
    });
  });

  /*
   |--------------------------------------------------------------------------
   | Login with Facebook
   |--------------------------------------------------------------------------
   */
  app.get('/auth/facebook/callback', function(req, res, next) {
    res.redirect('http://localhost?code=' + req.query.code);
  });

  app.post('/auth/facebook', function(req, res, next) {
    var accessTokenUrl = 'https://graph.facebook.com/oauth/access_token';
    var graphApiUrl = 'https://graph.facebook.com/me';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: config.facebook.clientSecret,
      redirect_uri: req.body.redirectUri
    };

    // Step 1. Exchange authorization code for access token.
    request.get({url: accessTokenUrl, qs: params, json: true}, function(err, response, accessToken) {
      if (response.statusCode !== 200) {
        return res.status(500).send({error: {message: accessToken.error.message}});
      }
      accessToken = qs.parse(accessToken);

      // Step 2. Retrieve profile information about the current user.
      request.get({url: graphApiUrl, qs: accessToken, json: true}, function(err, response, profile) {
        if (response.statusCode !== 200) {
          return res.status(500).send({error: {message: profile.error.message}});
        }
        if (req.headers.authorization) {
          User.findOne({facebook: profile.id}, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({
                error: {
                  message: 'There is already a Facebook account that belongs to you'
                }
              });
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.facebook.clientSecret);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({error: {message: 'User not found'}});
              }

              Role.findOne({name: 'application_user'}, function(err, role) {
                if (err) {
                  return next(new Error(errorHandler.getErrorMessage(err)));
                }
                user.facebook = profile.id;
                user.picture = user.picture || 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
                user.name = user.name || profile.name;
                user.email = user.email || profile.email;
                user.role = role.id;
                user.save(function() {
                  var token = createToken(user);
                  res.send({token: token});
                });
              });
            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({facebook: profile.id}, function(err, existingUser) {
            if (existingUser) {
              var token = createToken(existingUser);
              return res.send({token: token});
            }

            Role.findOne({name: 'application_user'}, function(err, role) {
              if (err) {
                return next(new Error(errorHandler.getErrorMessage(err)));
              }
              var user = new User();
              user.facebook = profile.id;
              user.email = profile.email;
              user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
              user.name = profile.name;
              user.role = role.id;
              user.save(function() {
                var token = createToken(user);
                res.send({token: token});
              });
            });
          });
        }
      });
    });
  });

  /*
   |--------------------------------------------------------------------------
   | Login with Google
   |--------------------------------------------------------------------------
   */
  app.get('/auth/google/callback', function(req, res, next) {
    res.redirect('http://localhost?code=' + req.query.code);
  });

  var doAuth = function(googleSecret, req, res, next) {
    var accessTokenUrl = 'https://accounts.google.com/o/oauth2/token';
    var peopleApiUrl = 'https://www.googleapis.com/plus/v1/people/me/openIdConnect';
    var params = {
      code: req.body.code,
      client_id: req.body.clientId,
      client_secret: googleSecret,
      redirect_uri: req.body.redirectUri,
      grant_type: 'authorization_code'
    };

    // Step 1. Exchange authorization code for access token.
    request.post(accessTokenUrl, {json: true, form: params}, function(err, response, token) {
      var accessToken = token.access_token;
      var headers = {Authorization: 'Bearer ' + accessToken};

      // Step 2. Retrieve profile information about the current user.
      request.get({url: peopleApiUrl, headers: headers, json: true}, function(err, response, profile) {

        // Step 3a. Link user accounts.
        if (req.headers.authorization) {
          User.findOne({google: profile.sub}, function(err, existingUser) {
            if (existingUser) {
              return res.status(409).send({error: {message: 'There is already a Google account that belongs to you'}});
            }
            var token = req.headers.authorization.split(' ')[1];
            var payload = jwt.decode(token, config.tokenSecret);
            User.findById(payload.sub, function(err, user) {
              if (!user) {
                return res.status(400).send({error: {message: 'User not found'}});
              }

              Role.findOne({name: 'application_user'}, function(err, role) {
                if (err) {
                  return next(new Error(errorHandler.getErrorMessage(err)));
                }

                user.google = profile.sub;
                user.email = user.name || profile.email;
                user.picture = user.picture || profile.picture;
                user.name = user.name || profile.name;
                user.role = role.id;
                user.save(function() {
                  var token = createToken(user);
                  res.send({token: token});
                });
              });

            });
          });
        } else {
          // Step 3b. Create a new user account or return an existing one.
          User.findOne({google: profile.sub}, function(err, existingUser) {
            if (existingUser) {
              return res.send({token: createToken(existingUser)});
            }
            Role.findOne({name: 'application_user'}, function(err, role) {
              if (err) {
                return next(new Error(errorHandler.getErrorMessage(err)));
              }
              var user = new User();
              user.google = profile.sub;
              user.email = profile.email;
              user.picture = profile.picture;
              user.name = profile.name;
              user.role = role.id;
              user.save(function(err) {
                var token = createToken(user);
                res.send({token: token});
              });
            });
          });
        }
      });
    });
  };

  //mobile uses another redirect url & google secret
  app.post('/auth/google/mobile', function(req, res, next) {
    doAuth(config.google.mobileSecret, req, res, next);
  });

  app.post('/auth/google', function(req, res, next) {
    doAuth(config.google.clientSecret, req, res, next);
  });

  /**
   * POST /signin
   * Sign in using email and password.
   */
  app.post('/api/signin', function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('password', 'Password cannot be blank').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
      return res.status(401).send({error: {message: 'Wrong email and/or password format'}});
    }

    User.findOne({email: {$regex: new RegExp(req.body.email, 'i')}}, function(err, user) {
      if (!user) {
        return res.status(401).send({error: {message: 'Wrong email and/or password'}});
      }
      user.comparePassword(req.body.password, function(err, isMatch) {
        if (!isMatch) {
          return res.status(401).send({error: {message: 'Wrong email and/or password'}});
        }
        res.send({token: createToken(user)});
      });
    });
  });

  /**
   * POST /signup
   * Create a new local account.
   */
  app.post('/api/signup', function(req, res, next) {
    req.assert('email', 'Email is not valid').isEmail();
    req.assert('name', 'Name is required').len(1);
    req.assert('password', 'Password must be at least 4 characters long').len(4);
    req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
      return res.json({error: {message: 'Invalid credentials'}});
    }

    User.findOne({email: {$regex: new RegExp(req.body.email, 'i')}}, function(err, existingUser) {

      if (err) {
        return next(new Error('Can not verify if the user exists!'));
      }

      if (existingUser) {
        return res.send({error: {message: 'Account with that email address already exists.'}});
      }
      Role.findOne({name: 'application_user'}, function(err, role) {

        if (err) {
          return next(new Error(errorHandler.getErrorMessage(err)));
        }

        var user = new User({
          email: req.body.email,
          password: req.body.password,
          name: req.body.name,
          role: role._id
        });
        user.save(function(err) {
          if (err) {
            return next(new Error(errorHandler.getErrorMessage(err)));
          }
          res.send({token: createToken(user)});
        });
      });
    });
  });
};
