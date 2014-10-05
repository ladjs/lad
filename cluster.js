
// # cluster

var recluster = require('recluster');
var path = require('path');
var IoC = require('electrolyte');

var cluster = recluster(path.join(__dirname, 'app.js'));

IoC.loader(IoC.node(path.join(__dirname, 'boot')));
IoC.loader('igloo', require('igloo'));
var logger = IoC.create('igloo/logger');

cluster.run();

process.on('SIGUSR2', function() {
  // reloading cluster
  logger.info('received SIGUSR2, reloading cluster...');
  cluster.reload();
});

// spawned cluster process.id
// run kill -s SIGUSR2 to reload
logger.info('spawned cluster, `kill -s SIGUSR2 %d` to reload', process.pid);
