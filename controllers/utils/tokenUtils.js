var jwt = require('jwt-simple');
var moment = require('moment');
var config = require('../../config/secrets');

/*
 |--------------------------------------------------------------------------
 | Generate JSON Web Token
 |--------------------------------------------------------------------------
 */
var createToken = function(user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(14, 'days').unix()
  };
  return jwt.encode(payload, config.tokenSecret);
};

exports.createToken = createToken;

/*
 |--------------------------------------------------------------------------
 | Login Required Middleware
 |--------------------------------------------------------------------------
 */
var ensureAuthenticated = function(req, res, next) {

  if (!req.headers.authorization) {
    return res.status(401).send({error: {message: 'Please make sure your request has an Authorization header'}});
  }
  var token = req.headers.authorization.split(' ')[1];
  var payload = jwt.decode(token, config.tokenSecret);
  if (payload.exp <= moment().unix()) {
    return res.status(401).send({error: {message: 'Token has expired'}});
  }
  req.user = payload.sub;
  next();
};

exports.ensureAuthenticated = ensureAuthenticated;

var ensureNotAuthenticated = function(req, res, next) {
  if (req.headers.authorization) {
    return res.redirect('/');
  }
  next();
};

exports.ensureNotAuthenticated = ensureNotAuthenticated;
