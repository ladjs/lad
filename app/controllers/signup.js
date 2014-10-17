
// # signup

var passport = require('passport');
var util = require('util');
var _ = require('underscore');
var _str = require('underscore.string');
_.mixin(_str.exports());

var validator = require('validator');
var randomstring = require('randomstring-extended');

exports = module.exports = function(settings, User) {

  function create(req, res, next) {

    // password validation
    User.validatePassword(req.body.password, function(errorMessage) {

      if (errorMessage) {
        return next({
          message: errorMessage,
          param: 'password'
        });
      }

      User.register({
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname
      }, req.body.password, registerUser);

    });

    function registerUser(err, user) {

      if (err) {
        return next(err);
      }

      if (!user) {
        return next(new Error('An error has occured while registering, please try later'));
      }

      res.format({

        html: function() {

          req.flash('success', 'Successfully signed up, check your inbox soon for a welcome email');

          passport.authenticate('local', {
            successReturnToOrRedirect: '/',
            successFlash: true,
            failureFlash: true,
            failureRedirect: true
          })(req, res, next);

        },

        json: function() {
          res.json(user);
        }

      });

      user.sendWelcomeEmail();

    }


  }

  return create;

};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/settings', 'models/user' ];
