
// # eskimo boilerplate

var path = require('path')
var igloo = require('igloo')
var IoC = require('electrolyte')
var bootable = require('bootable')
var bootableEnvironment = require('bootable-environment')
var eskimoServer = require('eskimo-server')

IoC.loader(IoC.node(path.join(__dirname, 'boot')))
IoC.loader('igloo', igloo.loader)
IoC.loader(eskimoServer)
IoC.loader('controllers', IoC.node(path.join(__dirname, 'app', 'controllers')))
IoC.loader('models', IoC.node(path.join(__dirname, 'app', 'models')))

var app = igloo.app(IoC)
var logger = IoC.create('igloo/logger')
var settings = IoC.create('igloo/settings')

app.phase(bootableEnvironment(path.join(__dirname, 'etc', 'env')))
app.phase(bootable.di.initializers(path.join(__dirname, 'etc', 'init')))
app.phase(bootable.di.routes(path.join(__dirname, 'app', 'routes')))
app.phase(IoC.create('eskimo/server'))

app.boot(function(err) {

  logger.info('app booted')

  if (err) {
    logger.error(err.message)
    if (settings.showStack)
      logger.error(err.stack)
    process.exit(0)
    return
  }

})

exports = module.exports = app
