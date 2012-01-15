
// # Register

var form     = require('express-form'),
    filter   = form.filter,
    field    = form.field,
    validate = form.validate;

function redirectToRegistration(req, res) {
  return res.render('register', {
      title: "Register"
    , email: req.form.email
    , name: {
          first: req.form.name.first
        , last: req.form.name.last
      }
    , company: req.form.company
  });
}

module.exports = function(app, db) {

  // ## Registration form
  app.get('/register', function(req, res) {
    if(req.loggedIn) {
      return res.redirect('/login');
    } else {
      res.render('register', {
        title: "Register",
      });
    }
  });

  // ## Process registration
  app.post('/register', form(
        filter("email").trim()
      , validate("email").required().isEmail()
      , filter("password").trim()
      , validate("password").required()
      , filter("password_confirmation").trim()
      , validate("password_confirmation").required()
          .equals(
            "field::password",
            "Password confirmation does not match entered password, try again")
      , filter("name.first").trim()
      , validate("name.first").required()
      , filter("name.last").trim()
      , validate("name.last").required()
      , filter("company").trim()
      , validate("company").required()
    ),
    function(req, res) {
      if(!req.form.isValid) {
        redirectToRegistration(req, res);
      } else {
        // Register the user and redirect to login
        var Users = db.model('Users');
        delete req.form.password_confirmation;
        Users.register(req.form, function(err, user) {
          if(err) {
            if(/duplicate key/.test(err)) {
              req.flash('error', 'An account is already registered for ' + req.form.email);
              redirectToRegistration(req, res);
            } else {
              req.flash('error', err);
              redirectToRegistration(req, res);
            }
          }
          if(user) {
            Users.authenticate(req.form.email, req.form.password, function(err, user) {
              if(err) {
                req.flash('error', err);
                res.redirect('/login');
              }
              if(user) {
                req.session.auth = user;
                // Send user a welcome email
                var nodemailer = require('nodemailer')
                  , emailSignature = require('../lib/email-signature')
                  , htmlMsg = ''
                      + '<p>Welcome ' + user.name.first + ',</p>'
                      + '<p>You have successfully created an account at our website.</p>'
                      + '<p>'
                      + 'Once logged in using your email address and password, you will have access to:'
                      + '<ul>'
                      + '<li><a href="http://yourdomain.com/my-account" target="_blank" title="Manage Account">Manage your account</a> information and preferences</li>'
                      + '<li>Access exclusive content at our <a href="http://yourdomain.com" target="_blank" title="Visit our website">website</a> in the future</li>'
                      + '</ul>'
                      + '</p>'
                      + '<p>If you have any questions, please do not hesitate to contact us.</p>'
                      + emailSignature("html")
                  , plainMsg = ''
                      + 'Welcome ' + user.name.first + ',\n\n'
                      + 'You have successfully created an account at our website.\n\n'
                      + 'Once logged in using your email address and password, you will have access to:\n\n'
                      + '  [1] Manage your account information and preferences\n'
                      + '  [2] Access exclusive content at our website in the future\n\n'
                      + 'If you have any questions, please do not hesitate to contact us.\n\n'
                      + 'Links:\n\n'
                      + '  1. http://yourdomain.com/my-account\n'
                      + '  2. http://yourdomain.com\n\n'
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
                    , subject: user.name.first + ', thank you for registering at our website'
                    , html: htmlMsg
                    , body: plainMsg
                  },
                  function(err, success) {
                    if(success) {
                      req.flash('success', 'You have successfully registered your account and are now logged in');
                    } else {
                      req.flash('error', 'An error occured, please try again');
                    }
                    if(req.session.redirectTo) {
                      var redirectTo = req.session.redirectTo;
                      delete req.session.redirectTo;
                      res.redirect(redirectTo);
                    } else {
                      res.redirect('/my-account');
                    }
                  }
                );
              }
            });
          }
        });
      }
    }
  );

};
