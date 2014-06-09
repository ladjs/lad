
// # eskimo boilerplate

var path = require('path')
var IoC = require('electrolyte')
var bootable = require('bootable')
var express = require('express')

// set up dependency injection loaders

IoC.loader('boot', IoC.node(path.join(__dirname, 'boot')))
IoC.loader('igloo', require('igloo'))
IoC.loader('controllers', IoC.node(path.join(__dirname, 'app', 'controllers')))
IoC.loader('models', IoC.node(path.join(__dirname, 'app', 'models')))

// build app

var app = bootable(express())
app.phase(IoC.create('igloo/update-notifier'))
app.phase(bootable.di.initializers())
app.phase(bootable.di.routes())
app.phase(IoC.create('igloo/error-handler'))
app.phase(IoC.create('igloo/server'))

// boot app

var logger = IoC.create('igloo/logger')
var settings = IoC.create('igloo/settings')

app.boot(function(err) {

  if (err) {
    logger.error(err.message)
    if (settings.showStack)
      logger.error(err.stack)
    process.exit(-1)
    return
  }

  logger.info('app booted')

})

exports = module.exports = app
