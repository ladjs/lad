
// # etc - init - sessions

var flash = require('connect-flash')
var passport = require('passport')
var session = require('express-session')

exports = module.exports = function(IoC, settings, sessions, User) {

  var app = this

  // add req.session cookie support
  settings.session.store = sessions
  app.use(session(settings.session))

  // add support for authentication
  app.use(passport.initialize())
  app.use(passport.session())

  // add passport strategies
  passport.use(User.createStrategy())
  passport.serializeUser(User.serializeUser())
  passport.deserializeUser(User.deserializeUser())

  // add flash message support
  app.use(flash())

  // add dynamic helpers for views
  app.use(function(req, res, next) {
    res.locals.messages = {
      success: req.flash('success'),
      error: req.flash('error'),
      info: req.flash('info'),
      warning: req.flash('warning')
    }
    next()
  })

}

exports['@require'] = [ '$container', 'igloo/settings', 'igloo/sessions', 'models/user' ]
