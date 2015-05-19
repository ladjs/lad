
// # security

var helmet = require('helmet');
var csrf = require('csurf');

exports = module.exports = function(IoC, settings, policies) {

  var app = this;

  // trust proxy
  if (settings.trustProxy) {
    app.enable('trust proxy');
  }

  // use helmet for security
  app.use(helmet());

  // cross site request forgery prevention (csrf)
  // (disabled for /api endpoints)
  if (settings.csrf.enabled) {
    app.all(policies.notApiRouteRegexp, function(req, res, next) {
      if (req.xhr) return next();
      csrf(settings.csrf.options)(req, res, next);
    });
  }

};

exports['@require'] = [ '$container', 'igloo/settings', 'policies' ];
