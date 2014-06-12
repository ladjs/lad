
// # security

var path = require('path')
var serveFavicon = require('serve-favicon')
var helmet = require('helmet')
var csrf = require('csurf')

exports = module.exports = function(IoC, settings) {

  var app = this

  // trust proxy
  if (settings.trustProxy)
    app.enable('trust proxy')

  // use helmet for security
  app.use(helmet.defaults())

  // ignore GET /favicon.ico
  app.use(serveFavicon(path.join(settings.publicDir, 'favicon.ico')))

  // cross site request forgery prevention (csrf)
  // note: you'd probably want to turn this off for API's
  if (settings.csrf.enabled)
    app.use(csrf(settings.csrf.options))

}

exports['@require'] = [ '$container', 'igloo/settings' ]
