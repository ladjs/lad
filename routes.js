
// app - routes

var bootable = require('bootable');

exports = module.exports = function(IoC, settings) {

  var app = this;

  // api
  app.phase(bootable.di.routes('./routes/api.js'));

  // home
  app.phase(bootable.di.routes('./routes/home.js'));

  // auth
  app.phase(bootable.di.routes('./routes/auth.js'));

  // my-account
  app.phase(bootable.di.routes('./routes/my-account.js'));

  // users
  app.phase(bootable.di.routes('./routes/users.js'));

  // error handler (always keep this last)
  app.phase(function() {
    var errorHandler = IoC.create('igloo/error-handler');
    app.use(errorHandler);
  });

};

exports['@require'] = [ '$container', 'igloo/settings' ];
