
// # forgot

var util = require('util');
var _ = require('underscore');
var moment = require('moment');
var randomstring = require('randomstring-extended');
var validator = require('validator');

exports = module.exports = function(settings, User, logger, email) {

  function forgot(req, res, next) {

    if (!_.isString(req.body.email) || !validator.isEmail(req.body.email)) {
      return next(new Error('Invalid email address entered'));
    }

    var user;

    User.findOne({
      email: req.body.email
    }, findUser);

    function findUser(err, _user) {
      if (err) {
        return next(err);
      }

      if (!_user) {
        return next(new Error('No such user with that email exists'));
      }

      user = _user;
      user.reset_token = randomstring.token();
      user.reset_at = moment();
      user.save(saveUser);
    }

    function saveUser(err) {
      if (err) {
        return next(err);
      }

      req.flash('success', 'Please check your email for reset password instructions');
      res.redirect('/');

      email('forgot', {
        user: user,
        resetURL: util.format('%s/reset/%s', settings.url, user.reset_token)
      }, {
        to: user.full_email,
        subject: 'Eskimo - Reset Password'
      }, function(err, responseStatus) {
        if (err) {
          return logger.error(err);
        }

        logger.info('Sent reset password email to %s', user.email);
      });
    }

  }

  return forgot;

};

exports['@singleton'] = true;
exports['@require'] = [ 'igloo/settings', 'models/user', 'igloo/logger', 'igloo/email' ];
