var config = require('../../config/secrets');
var client = require('twilio')(config.twilio.sid, config.twilio.token);
var msg = {};

msg.sendMsg = function(to, message, callback) {
  client.sendMessage({
    to: to,
    from: '+16198666634', // your Twilio number
    body: message // The body of the text message
  }, function(error, message) {
    // Log the response to DiskDB to auditing purposes
    if (error) {
      console.log('ERROR!', error);
    } else {
      console.log('SUCCESS!', message);
    }
    callback(error, message);
  });
};

module.exports = msg;
