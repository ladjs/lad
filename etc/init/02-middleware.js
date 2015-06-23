
// # middleware

var lessMiddleware = require('less-middleware');
var serveFavicon = require('serve-favicon');
var path = require('path');
var serveStatic = require('serve-static');
var winstonRequestLogger = require('winston-request-logger');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var paginate = require('express-paginate');
var responseTime = require('response-time');
var auth = require('basic-auth');
var _ = require('underscore');
var expressJade = require('express-jade');

exports = module.exports = function(IoC, logger, settings, policies) {

  var app = this;

  // ignore GET /favicon.ico
  app.use(serveFavicon(path.join(settings.publicDir, 'favicon.ico')));

  if (settings.server.env === 'development') {

    if (settings.less.enabled) {
      // less middleware
      app.use(lessMiddleware(settings.less.path, settings.less.options));
    }

    // express-jade templates (client side templates)
    app.get('/js/templates/*', expressJade(settings.views.dir));

  }

  // static server (always keep this first)
  // <http://goo.gl/j2BEl5>
  app.use(serveStatic(settings.publicDir, settings.staticServer));

  // add global policy for non api prefixed endpoints
  if (settings.basicAuth.enabled)
    app.all(policies.notApiRouteRegexp, function(req, res, next) {
      var creds = auth(req);
      if (!creds || creds.name !== settings.basicAuth.name || creds.pass !== settings.basicAuth.pass) {
        res
          .header('WWW-Authenticate', 'Basic realm="Development Environment"')
          .status(401)
          .end();
        return;
      }
      next();
    });

  // adds X-Response-Time header
  app.use(responseTime({
    digits: 5
  }));

  // prepare req.log for error handler
  app.use(function(req, res, next) {
    req.log = {
      response_time: new Date().getTime(),
      path: req.path,
      query: req.query,
      body: req.body,
      params: req.params
    };
    next();
  });

  // winston request logger before everything else
  // but only if it was enabled in settings
  if (settings.logger.requests) {
    app.use(winstonRequestLogger.create(logger));
  }

  // parse request bodies
  // support _method (PUT in forms etc)
  app.use(
    bodyParser.json(),
    bodyParser.urlencoded({
      extended: true
    }),
    methodOverride('_method')
  );

  // pagination
  app.use(paginate.middleware(10, 50));

};

exports['@require'] = [ '$container', 'igloo/logger', 'igloo/settings', 'policies' ];
