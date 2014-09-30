
// app - routes

var bootable = require('bootable')
var serveStatic = require('serve-static')

exports = module.exports = function(IoC, settings) {

  var app = this
  var middleware = {}

  // middleware helpers
  middleware.ensureLoggedIn = ensureLoggedIn
  middleware.ensureLoggedOut = ensureLoggedOut

  // home
  app.phase(bootable.di.routes('./routes/home.js'))

  // auth
  app.phase(bootable.di.routes('./routes/auth.js'))

  // my-account
  app.phase(bootable.di.routes('./routes/my-account.js'))

  // users
  app.phase(bootable.di.routes('./routes/users.js'))

  // static server
  app.use(serveStatic(settings.publicDir, settings.staticServer))

}

exports['@require'] = [ '$container', 'igloo/settings' ]
