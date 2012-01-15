
// # Reset password

var form     = require('express-form'),
    filter   = form.filter,
    field    = form.field,
    validate = form.validate;

module.exports = function(app, db) {

  // ## Reset password form
  app.get('/reset-password/:random_string', function(req, res) {
    if(req.loggedIn) {
      req.flash('error', 'You are already logged in');
      res.redirect('/');
    } else {
      if(req.params.random_string) {
        var randomString = req.params.random_string;
        res.render('reset-password', {
            title: "Reset Password"
          , random_string: randomString
        });
      } else {
        req.flash('error', 'Not a valid request, please try again');
        res.redirect('/forgot-password');
      }
    }
  });

  // ## Process registration
  app.post('/reset-password', form(
        filter("email").trim()
      , validate("email").required().isEmail()
      , filter("random_string").trim()
      , validate("random_string").required()
      , filter("password").trim()
      , validate("password").required()
      , filter("password_confirmation").trim()
      , validate("password_confirmation").required()
          .equals(
            "field::password",
            "Password confirmation does not match entered password, try again")
    ),
    function(req, res) {
      if(!req.form.isValid) {
        req.flash('error', 'Not a valid request, please try again');
        res.redirect('/forgot-password');
      } else {
        var newPassword = req.form.password;
        delete req.form.password;
        delete req.form.password_confirmation;
        var Users = db.model('Users');
        Users.findOne(req.form, function(err, user) {
          if(user) {
            // TODO: we currently can't do this because mongoose doesn't support
            //  https://github.com/LearnBoost/mongoose/issues/519
            // delete user.random_string;
            // user.markModified('random_string');
            // Temporary fix is to set it as an empty string
            user.random_string = '';
            user.password = newPassword;
            user.save(function(err, user) {
              if(user) {
                req.flash('success', 'You have successfully changed your password');
                res.redirect('/login');
              } else {
                console.log(err);
                req.flash('error', 'An error has occured, please try again');
                res.redirect('/forgot-password');
              }
            });
          } else {
            req.flash('error', 'Not a valid request, please try again');
            res.redirect('/forgot-password');
          }
        });
      }
    }
  );
};
