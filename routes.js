
// app - routes

var serveStatic = require('serve-static')

exports = module.exports = function(IoC, settings) {

  var app = this

  // home
  app.get('/', IoC.create('controllers/home'))

  // users
  app.resource('users', IoC.create('controllers/users'))

  // static server
  app.use(serveStatic(settings.publicDir, settings.staticServer))

}

exports['@require'] = [ '$container', 'igloo/settings' ]
