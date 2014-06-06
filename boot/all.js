
// # boot - all

var path = require('path')
var serveStatic = require('serve-static')
var flash = require('connect-flash')
var passport = require('passport')
var session = require('express-session')
var methodOverride = require('method-override')
var serveFavicon = require('serve-favicon')
var cookieParser = require('cookie-parser')
var bodyParser = require('body-parser')
var helmet = require('helmet')

exports = module.exports = function(settings, sessions, User) {

  return function(app) {

    // set the environment
    app.set('env', settings.server.env)

    // trust proxy
    if (settings.trustProxy)
      app.enable('trust proxy')

    // set the default views directory
    app.set('views', settings.views.dir)

    // set the default view engine
    app.set('view engine', settings.views.engine)

    // use helmet for security
    app.use(helmet.defaults())

    // ignore GET /favicon.ico
    app.use(serveFavicon(path.join(settings.publicDir, 'favicon.ico')))

    // pass a secret to cookieParser() for signed cookies
    app.use(cookieParser(settings.cookieParser))

    // parse request bodies
    app.use(bodyParser())

    // support _method (PUT in forms etc)
    app.use(methodOverride())

    // add req.session cookie support
    settings.session.store = sessions
    app.use(session(settings.session))

    // add flash message support
    app.use(flash())

    // add dynamic helpers for views
    app.use(function(req, res, next) {
      res.locals.req = req
      res.locals.messages = {
        success: req.flash('success'),
        error: req.flash('error'),
        info: req.flash('info'),
        warning: req.flash('warning')
      }
      next()
    })

    // add support for authentication
    app.use(passport.initialize())
    app.use(passport.session())

    passport.use(User.createStrategy())
    passport.serializeUser(User.serializeUser())
    passport.deserializeUser(User.deserializeUser())

    // static server
    app.use(serveStatic(settings.publicDir, settings.staticServer))

  }

}

exports['@require'] = [ 'settings', 'igloo/sessions', 'models/user' ]
