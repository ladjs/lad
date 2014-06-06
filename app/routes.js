
// app - routes

exports = module.exports = function(IoC, errorHandler) {

  var app = this

  app.get('/', IoC.create('controllers/home'))

  app.resource('users', IoC.create('controllers/users'))

  app.use(errorHandler)

}

exports['@require'] = [ '$container', 'igloo/error-handler' ]
