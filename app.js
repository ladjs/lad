
// # app

var path = require('path');
var IoC = require('electrolyte');
var bootable = require('bootable');
var express = require('express');

// change the working directory to the root directory

process.chdir(__dirname);

// dependency injection

IoC.loader(IoC.node(path.join(__dirname, 'boot')));
IoC.loader('igloo', require('igloo'));
IoC.loader('controllers', IoC.node(path.join(__dirname, 'app', 'controllers')));
IoC.loader('models', IoC.node(path.join(__dirname, 'app', 'models')));

// phases

var app = bootable(express());

// removing this since it seems we still get errors
// <https://github.com/yeoman/update-notifier/issues/25#issuecomment-52824043>
//app.phase(IoC.create('igloo/update-notifier'))

app.phase(bootable.di.initializers());
app.phase(bootable.di.routes());
app.phase(IoC.create('igloo/server'));

// boot

var logger = IoC.create('igloo/logger');
var settings = IoC.create('igloo/settings');

app.boot(function(err) {

  if (err) {
    logger.error(err.message);

    if (settings.showStack) {
      logger.error(err.stack);
    }

    process.exit(-1);
    return;
  }

  logger.info('app booted');

});

exports = module.exports = app;
