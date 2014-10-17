
// # security

var path = require('path');
var serveFavicon = require('serve-favicon');
var helmet = require('helmet');
var csrf = require('csurf');

exports = module.exports = function(IoC, settings) {

  var app = this;

  // trust proxy
  if (settings.trustProxy) {
    app.enable('trust proxy');
  }

  // use helmet for security
  app.use(helmet());

  // ignore GET /favicon.ico
  app.use(serveFavicon(path.join(settings.publicDir, 'favicon.ico')));

  // cross site request forgery prevention (csrf)
  // note: disabled automatically for XHR (AJAX) requests
  // and requests with `/api` prefixed route path
  if (settings.csrf.enabled) {

    app.use(function(req, res, next) {

      if (!req.xhr && req.path.indexOf('/api') !== 0) {
        csrf(settings.csrf.options)(req, res, next);
        return;
      }

      next();

    });

  }

};

exports['@require'] = [ '$container', 'igloo/settings' ];
