
// # etc - init - sessions

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

  passport.use(User.createStrategy())
  passport.serializeUser(User.serializeUser())
  passport.deserializeUser(User.deserializeUser())

}

exports['@require'] = [ '$container', 'settings', 'igloo/sessions', 'models/user' ]
