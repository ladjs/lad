
// # Forgot Password

var form     = require('express-form')
  , filter   = form.filter
  , field    = form.field
  , validate = form.validate;

module.exports = function(app, db) {

  // ## Forgot password form
  app.get('/forgot-password', function(req, res) {
    if(req.loggedIn) {
      return res.redirect('/login');
    } else {
      res.render('forgot-password', {
        title: "Forgot Password",
      });
    }
  });

  // ## Process recovery
  app.post('/forgot-password', form(
        filter("email").trim()
      , validate("email").required().isEmail()
    ),
    function(req, res) {
      if(!req.form.isValid) {
        res.redirect('/forgot-password');
      } else {
        // Check if account exists and dispatch /account-recovery/:hash link
        //  This hash link will allow user to change their password
        var Users = require('../schemas/users')(db);
        Users.findOne(req.form, function(err, user) {
          if(err) {
            req.flash('error', 'An error occured, please try again');
            res.redirect('/forgot-password');
          }
          if(!user) {
            req.flash('error', 'No account exists with an email address of '
              + '<strong>'
              + req.form.email
              + '</strong>');
            res.redirect('/forgot-password');
          } else {
            // Store random string in user's table as user.random_string
            var randomString = require('../lib/random-string.js');
            user.random_string = randomString(16);
            user.save(function(err, user) {
              if(user) {
                // Send user an email to reset their password
                var nodemailer = require('nodemailer')
                  , emailSignature = require('../lib/email-signature')
                  , htmlMsg = ''
                      + '<p>' + user.name.first + ',</p>'
                      + '<p>You can reset your password by clicking the unique link below:</p>'
                      + '<p><a href="http://yourdomain.com/reset-password/' + user.random_string + '" target="_blank" title="Reset your password">'
                      + 'http://yourdomain.com/reset-password/' + user.random_string + '</a></p>'
                      + emailSignature("html")
                  , plainMsg = ''
                      + user.name.first + ',\n\n'
                      + 'You can reset your password by clicking the unique link below:\n\n'
                      + 'http://yourdomain.com/reset-password/' + user.random_string + '\n\n'
                      + emailSignature("text");
                nodemailer.SMTP = {
                    host: 'smtp.gmail.com'
                  , port: 465
                  , ssl: true
                  , use_authentication: true
                  , user: 'llamas@yourdomain.com'
                  , pass: 'alpacas'
                };
                nodemailer.send_mail(
                  {
                      sender: '"Llamas" <llamas@yourdomain.com>'
                    , to: req.form.email
                    , subject: user.name.first + ', reset your password using this link'
                    , html: htmlMsg
                    , body: plainMsg
                  },
                  function(err, success) {
                    if(success) {
                      req.flash('success', ''
                        + 'An email has been sent to '
                        + '<strong>' + req.form.email + '</strong> '
                        + 'with a link to reset the account\'s password');
                    } else {
                      req.flash('error', 'An error occured, please try again');
                    }
                    res.redirect('/forgot-password');
                  }
                );
              } else {
                console.log(err);
                req.flash('error', 'An error occured, please try again');
              }
            });
          }
        });
      }
    }
  );

};
