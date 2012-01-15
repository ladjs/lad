
// # Login

var form     = require('express-form')
  , filter   = form.filter
  , field    = form.field
  , validate = form.validate;

module.exports = function(app, db) {

  var Users = db.model('Users')
    , access = Users.access;

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
    if(!req.form.isValid) {
      res.render('login', {
          title: "Login"
        , email: req.form.email
      });
    } else {
      Users.authenticate(req.form.email, req.form.password, function(err, user) {
        if(err) {
          req.flash('error', err);
          res.redirect('/login');
        }
        if(user) {
          req.session.auth = user;
          Users
            .findById(req.session.auth._id)
            .populate('_group')
            .run(function (err, user) {
              if(err) {
                console.log(err);
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
                  res.redirect('/');
                  /*
                  if(typeof user._group === "undefined") {
                    res.redirect('/');
                  } else {
                    if(typeof user._group.id !== "undefined"
                      && ((user._group.id === "super_admin")
                      || (user._group.id === "admin"))) {
                      res.redirect('/admin');
                    } else {
                      res.redirect('/my-account');
                    }
                  }
                  */
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
