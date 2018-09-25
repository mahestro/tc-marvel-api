var router = require('express').Router();
var sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

router
  .post('/', function(req, res, next) {
    var message = req.body.message;
    sgMail.send(message)
      .then(function() {
        return res.json({success: true});
      })
      .catch(function(err) {
        return next();
      });
  });

module.exports = router;
