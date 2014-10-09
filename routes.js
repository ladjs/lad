
// app - routes

var bootable = require('bootable');
var serveStatic = require('serve-static');

exports = module.exports = function(IoC, settings) {

  var app = this;

  // home
  app.phase(bootable.di.routes('./routes/home.js'));

  // auth
  app.phase(bootable.di.routes('./routes/auth.js'));

  // my-account
  app.phase(bootable.di.routes('./routes/my-account.js'));

  // users
  app.phase(bootable.di.routes('./routes/users.js'));

  // keep these last
  app.phase(function() {

    // static server
    app.use(serveStatic(settings.publicDir, settings.staticServer));

    // error handler
    var errorHandler = IoC.create('igloo/error-handler');
    app.use(errorHandler);

  });

};

exports['@require'] = [ '$container', 'igloo/settings' ];
