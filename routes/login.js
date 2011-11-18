
// # Login

var form     = require('express-form')
  , filter   = form.filter
  , field    = form.field
  , validate = form.validate;

module.exports = function(app, db) {

  var access = require('../schemas/user')(db).access;

  app.get('/login', access(), function(req, res) {
    res.render('login', {
      title: "Login"
    });
  });

  app.post('/login', access(), form(
      filter("email").trim()
    , validate("email").required().isEmail()
    , filter("password").trim()
    , validate("password").required()
  ), function(req, res) {
    var User = require('../schemas/user')(db);
    if(!req.form.isValid) {
      res.render('login', {
          title: "Login"
        , email: req.form.email
      });
    } else {
      User.authenticate(req.form.email, req.form.password, function(err, user) {
        if(err) {
          req.flash('error', err);
          res.redirect('/login');
        }
        if(user) {
          req.session.auth = user;
          User
            .findById(req.session.auth._id)
            .populate('_group')
            .run(function (err, user) {
              if(err) {
                req.flash('error', err);
                return res.redirect('/');
              }
              if(user) {
                req.flash('success', 'You have successfully logged in');
                if(req.session.redirectTo) {
                  var redirectTo = req.session.redirectTo;
                  delete req.session.redirectTo;
                  res.redirect(redirectTo);
                } else {
                  if(typeof user._group === "undefined") {
                    res.redirect('/my-account');
                  } else {
                    if(typeof user._group.name !== "undefined"
                      && ((user._group.name === "Super Admin")
                      || (user._group.name === "Admin"))) {
                      res.redirect('/admin');
                    } else {
                      res.redirect('/my-account');
                    }
                  }
                }
              } else {
                req.flash('error', 'Your account no longer exists');
                res.redirect('/logout');
              }
            });
        }
      });
    }
  });
};
