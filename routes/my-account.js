
// # My Account

var form     = require('express-form')
  , filter   = form.filter
  , field    = form.field
  , validate = form.validate
  , _        = require('underscore');

function redirectToMyAccount(req, res) {
  return res.render('my-account', {
      title: "My Account"
    , email: req.form.email
    , name: {
          first: req.form.name.first
        , last: req.form.name.last
      }
    , company: req.form.company
  });
}

module.exports = function(app, db) {

  var Users = db.model('Users')
    , access = Users.access;

  // ## My Account
  app.get('/my-account', access(), function(req, res) {
    Users
      .findById(req.session.auth._id)
      .run(function (err, user) {
        if(err) {
          req.flash('error', err);
          return res.redirect('/');
        }
        if(user) {
          // Populate user information
          res.render('my-account', {
              title: "My Account"
            , email: user.email
            , name: {
                  first: user.name.first
                , last: user.name.last
              }
            , company: user.company
          });
        }
      });
  });

  // ## Process changes and update session.auth properties
  app.post('/my-account', form(
        filter("email").trim()
      , validate("email").required().isEmail()
      , filter("password").trim()
      , filter("password_confirmation").trim()
      , filter("name.first").trim()
      , validate("name.first").required()
      , filter("name.last").trim()
      , validate("name.last").required()
      , filter("company").trim()
      , validate("company").required()
    ),
    function(req, res) {
      if(!req.form.isValid) {
        redirectToMyAccount(req, res);
      } else {
        var changed = false;
        var newPassword = '';
        // Check if user wants to change password
        if(req.form.password !== "" && req.form.password_confirmation !== "") {
          if(req.form.password !== req.form.password_confirmation) {
            req.flash('error', 'Password confirmation does not match entered password, try again');
            redirectToMyAccount(req, res);
          } else {
            changed = true;
            newPassword = req.form.password;
          }
        }
        delete req.form.password;
        delete req.form.password_confirmation;
        // Save the user's changes and redirect to My Account
        Users.findById(req.session.auth._id, function(err, user) {
          if(err) {
            req.flash('error', 'An error occured, please try again');
            redirectToMyAccount(req, res);
          }
          if(user) {
            // Iterate through object properties
            for(var attr in req.form) {
              if(user[attr] !== req.form[attr]) {
                if(attr !== "name") {
                  changed = true;
                  user[attr] = req.form[attr];
                } else {
                  if(user.name.first !== req.form.name.first) {
                    changed = true;
                    user.name.first = req.form.name.first;
                  }
                  if(user.name.last !== req.form.name.last) {
                    changed = true;
                    user.name.last = req.form.name.last;
                  }
                }
              }
            }
            if(changed) {
              // Save the user's object
              user.save(function(err, user) {
                if(err) {
                  if(/duplicate key/.test(err)) {
                    req.flash('error', 'An account is already registered for ' + req.form.email);
                    redirectToMyAccount(req, res);
                  } else {
                    req.flash('error', err);
                    redirectToMyAccount(req, res);
                  }
                }
                req.flash('success', 'Changes to your account information have been saved');
                if(user) {
                  if (newPassword !== '') {
                    user.setPassword(newPassword, function(err) {
                      if (err) throw err;
                      req.flash('success', 'New password set successfully');
                      return res.redirect('/my-account');
                    });
                  } else {
                    return res.redirect('/my-account');
                  }
                }
              });
            } else {
              req.flash('notice', 'No changes were made to your information');
              redirectToMyAccount(req, res);
            }
          } else {
            req.flash('notice', 'Your requested action was not fulfilled, please try again');
            redirectToMyAccount(req, res);
          }
        });
      }
    }
  );

};
