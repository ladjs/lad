
// # sessions

var flash = require('connect-flash')
var passport = require('passport')
var session = require('express-session')
var cookieParser = require('cookie-parser')

exports = module.exports = function(IoC, settings, sessions) {

  var app = this

  // pass a secret to cookieParser() for signed cookies
  app.use(cookieParser(settings.cookieParser))

  // add req.session cookie support
  settings.session.store = sessions
  app.use(session(settings.session))

  // add support for authentication
  app.use(passport.initialize())
  app.use(passport.session())

  // add flash message support
  app.use(flash())

  // add passport strategies
  /*
  passport.use(User.createStrategy())
  passport.serializeUser(User.serializeUser())
  passport.deserializeUser(User.deserializeUser())
  */

}

exports['@require'] = [ '$container', 'igloo/settings', 'igloo/sessions' ]
