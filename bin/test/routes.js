
// app - routes

exports = module.exports = function(IoC) {

  var app = this

  app.get('/', IoC.create('controllers/home'))

  app.resource('users', IoC.create('controllers/users'))

}

exports['@require'] = [ '$container' ]
