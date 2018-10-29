/**
 * Module dependencies.
 */
var express = require('express');
var cookieParser = require('cookie-parser');
var compress = require('compression');
var bodyParser = require('body-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var multer = require('multer');
var cors = require('cors');
var _ = require('lodash');
var Promise = require('promise');
var path = require('path');
var mongoose = require('mongoose');
var expressValidator = require('express-validator');

var config = require('./config/secrets');
var User = require('./models/user');

/**
 * Home controller.
 */
var homeController = require('./controllers/home');

/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(config.db[app.get('env')]);
mongoose.connection.on('error', function() {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
});

/**
 * Express configuration.
 */
app.set('port', process.env.PORT || 3005);

var whitelist = [
  //the ionic app run on real device
  'http://localhost',
  // replace with yours IP only if execute the ionic app on a real device with: ionic run android -l -s -c
  'http://192.168.1.4:8100',
  'http://192.168.1.6:8100',
  'http://localhost:8100'
];
var corsOptions = {
  origin: function(origin, callback) {
    var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
    //callback(null, originIsWhitelisted);
    callback(null, true);
  },
  credentials: true
};
app.use(cors(corsOptions));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compress());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(multer({
  dest: path.join(__dirname, 'uploads'),
  rename: function(fieldname, filename) {
    return filename + '_' + Date.now();
  }
}));
app.use(expressValidator());
app.use(methodOverride());
app.use(cookieParser());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

// Force HTTPS on Heroku
if (app.get('env') === 'production') {
  app.use(function(req, res, next) {
    var protocol = req.get('x-forwarded-proto');
    protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url);
  });
}

app.use(express.static(path.join(__dirname, 'public'), {maxAge: 86400000}));

app.get('/', homeController.index);

var getCurrentUser = function(id) {
  var promise = new Promise(function(resolve, reject) {
    User.findById(id).populate('role').exec(function(err, user) {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
  return promise;
};

var sendAuthorizeError = function(res) {
  res.send(403, {
    error: {
      msg: 'User is not authorized to perform the request.'
    }
  });
};

//API v1
var canAccess = {
  if_admin: function(req, res, next) {
    getCurrentUser(req.user).then(function(user) {
      if (!user.id) {
        return next(new Error('Can not get current user!'));
      }
      if (user.role === 'application_user' || user.role === 'business_provider') {
        return sendAuthorizeError(res);
      }
      next();
    });
  },

  if_admin_or_business_provider: function(req, res, next) {
    getCurrentUser(req.user).then(function(user) {
      if (!user.id) {
        return next(new Error('Can not get current user!'));
      }
      if (req.user.role.name === 'application_user') {
        return sendAuthorizeError(res);
      }
      next();
    });
  },

  if_business_provider: function(req, res, next) {
    getCurrentUser(req.user).then(function(user) {
      if (!user.id) {
        return next(new Error('Can not get current user!'));
      }
      if (req.user.role.name !== 'business_provider') {
        return sendAuthorizeError(res);
      }
      next();
    });
  }
};

require(path.join(__dirname, '/controllers/api/auth')).configure(app);
require(path.join(__dirname, '/controllers/api/users')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/roles')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/hubs')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/tags')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/event_types')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/events')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/attachments')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/activities')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/business_profiles')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/business_categories')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/business_followers')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/hub_followers')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/user_friends')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/hub_muters')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/soundtracks')).configure(app, canAccess);
require(path.join(__dirname, '/controllers/api/twilio')).configure(app, canAccess);

//Error handler

// if there's no such route
app.use(function(req, res, next) {
  res.status(404);
  return res.send({
    error: {
      message: 'The requested url not found'
    }
  });
});

app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  var env = app.get('env');
  if (env !== 'production') {
    res.send({
      error: {
        message: err.stack
      }
    });
  } else {
    res.send({
      error: {
        message: err.message
      }
    });
  }
});

require('./db_seed')();

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
