
// # middleware

var winstonRequestLogger = require('winston-request-logger');
var methodOverride = require('method-override');
var bodyParser = require('body-parser');
var paginate = require('express-paginate');
var responseTime = require('response-time');

exports = module.exports = function(IoC, logger, settings) {

  var app = this;

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
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({
    extended: true
  }));

  // support _method (PUT in forms etc)
  app.use(methodOverride('_method'));

  // support live reload
  if (settings.server.env === 'development') {
    app.use(require('connect-livereload')(settings.liveReload));
    logger.info('livereload server started at port ' + settings.liveReload.port);
  }

  // pagination
  app.use(paginate.middleware(10, 50));

};

exports['@require'] = [ '$container', 'igloo/logger', 'igloo/settings' ];
