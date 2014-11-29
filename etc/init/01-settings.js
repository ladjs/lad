
// # settings

var compress = require('compression');
var https = require('https');
var http = require('http');

exports = module.exports = function(IoC, settings) {

  var app = this;

  // set the environment
  app.set('env', settings.server.env);

  // set the default views directory
  app.set('views', settings.views.dir);

  // set the default view engine
  app.set('view engine', settings.views.engine);

  if (settings.server.env === 'development') {

    // make view engine output pretty
    app.locals.pretty = true;

  }

  if (settings.server.env === 'production') {

    // enable view caching
    app.enable('view cache');

    // compress response data with gzip/deflate
    // this overwrites res.write and res.end functions
    app.use(compress());

  }

  if (settings.server.ssl.enabled) {
    this.server = https.createServer(settings.server.ssl.options, this);
  } else {
    this.server = http.createServer(this);
  }

};

exports['@require'] = [ '$container', 'igloo/settings' ];
