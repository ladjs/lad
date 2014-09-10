
// app - routes

var serveStatic = require('serve-static')

exports = module.exports = function(IoC, settings) {

  var app = this

  // home
  app.get('/', IoC.create('controllers/home'))

  // users
  /*
  var users = IoC.create('controllers/users')
  var usersRouter = express.Router()
  usersRouter.get('/', users.index)
  usersRouter.get('/new', users.new)
  usersRouter.post('/', users.create)
  usersRouter.get('/:id', users.show)
  usersRouter.get('/:id/edit', users.edit)
  usersRouter.put('/:id', users.update)
  usersRouter.delete('/:id', users.destroy)
  app.use('/users', usersRouter)
  */

  // static server
  app.use(serveStatic(settings.publicDir, settings.staticServer))

}

exports['@require'] = [ '$container', 'igloo/settings' ]
