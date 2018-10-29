exports.configure = function(app, canAccess) {
  /**
   * POST /api/sendmsg
   * Sent a text message
   */
  app.post('/api/sendmsg', function(req, res, next) {
    var msg = req.body;

    if (!msg || !msg.to || !msg.text) {
      return res.send({error: {message: 'invalid data'}});
    }

    var twClient = require('../twilio/message').sendMsg(msg.to, msg.text, function(error, message) {
      if (error) {
        res.send({error: {message: error}});
      } else {
        res.send({message: message.sid});
      }
    });
  });
};
