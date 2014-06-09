
// # etc - init - security

var path = require('path')
var cookieParser = require('cookie-parser')
var serveFavicon = require('serve-favicon')
var helmet = require('helmet')

exports = module.exports = function(IoC, settings) {

  var app = this

  // trust proxy
  if (settings.trustProxy)
    app.enable('trust proxy')

  // use helmet for security
  app.use(helmet.defaults())

  // ignore GET /favicon.ico
  app.use(serveFavicon(path.join(settings.publicDir, 'favicon.ico')))

  // pass a secret to cookieParser() for signed cookies
  app.use(cookieParser(settings.cookieParser))

  // TODO: csrf

}

exports['@require'] = [ '$container', 'settings' ]
