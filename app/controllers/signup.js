
// # sign up

var _ = require('underscore')
var _str = require('underscore.string')
_.mixin(_str.exports())

var validator = require('validator')
var randomstring = require('randomstring-extended')

exports = module.exports = function(settings, logger, email, User) {

  function create(req, res, next) {

    // email
    if (_.isBlank(req.body.email))
      return next({
        message: 'Email was blank',
        param: 'email'
      })

    // name
    if (_.isBlank(req.body.name))
      return next({
        message: 'First name was blank',
        param: 'name'
      })

    // surname
    if (_.isBlank(req.body.surname))
      return next({
        message: 'Last name was blank',
        param: 'surname'
      })

    // password validation
    User.validatePassword(req.body.password, function(errorMessage) {

      if (errorMessage) return next({
        message: errorMessage,
        param: 'password'
      })

      User.register({
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname
      }, req.body.password, registerUser)

    })

    function registerUser(err, user) {

      if (err) return next(err)

      req.flash('success', 'Successfully signed up, check your inbox soon for a welcome email')
      next()

      // Send welcome email here
      email('welcome', {
        user: user,
        url: settings.url
      }, {
        to: user.full_email,
        subject: 'Eskimo - Welcome to Eskimo'
      }, function(err, responseStatus) {
        if (err) return logger.error(err)
        logger.info('Sent welcome email to %s', user.email)
      })
    }


  }

  return create

}

exports['@singleton'] = true
exports['@require'] = [ 'igloo/settings', 'igloo/logger', 'igloo/email', 'models/user' ]
