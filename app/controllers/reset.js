
// # reset

var _ = require('underscore');
var _str = require('underscore.string');
_.mixin(_str.exports());

var validator = require('validator');
var moment = require('moment');

exports = module.exports = function(User) {

  function get(req, res, next) {
    if (!_.isString(req.params.reset_token)) {
      return next(new Error('Reset token is invalid'));
    }

    res.render('reset', {
      title: 'Reset your password'
    });
  }

  function post(req, res, next) {

    // reset_token
    if (_.isBlank(req.params.reset_token)) {
      return next({
        param: 'reset_token',
        message: 'Reset token is blank'
      });
    }

    // email
    if (_.isBlank(req.body.email) || !validator.isEmail(req.body.email)) {
      return next({
        param: 'email',
        message: 'Email is blank or not valid'
      });
    }

    User.validatePassword(req.body.password, function(errorMessage) {

      if (errorMessage) {
        return next({
          param: 'password',
          message: errorMessage
        });
      }

      // verify that user exists
      User.findOne({
        email: req.body.email,
        reset_token: req.params.reset_token
      }, findUser);

    });


    function findUser(err, user) {

      if (err) {
        return next(err);
      }

      if (!user) {
        return next(new Error('No user with that email and reset token was found'));
      }

      // verify that user.reset_at is within past 24 hours
      var resetAt = moment(user.reset_at);
      if (moment().subtract('days', 1).isAfter(resetAt)) {
        req.flash('error', 'Reset token expired, please try to reset again');
        return res.redirect('/forgot');
      }

      // set new password for the user
      user.setPassword(req.body.password, setPassword);

    }

    function setPassword(err, user) {
      if (err) {
        return next(err);
      }

      user.reset_token = '';
      user.save(saveUser);
    }

    function saveUser(err) {
      if (err) {
        return next(err);
      }

      // tell user that password changed
      req.flash('success', 'Password successfully changed, please try to log in');
      // take them to the log in page
      res.redirect('/login');
    }

  }

  return {
    get: get,
    post: post
  };

};

exports['@singleton'] = true;
exports['@require'] = [ 'models/user' ];
