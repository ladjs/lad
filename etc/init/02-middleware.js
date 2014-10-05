
// # middleware

var winstonRequestLogger = require('winston-request-logger')
var methodOverride = require('method-override')
var bodyParser = require('body-parser')
var paginate = require('express-paginate')

exports = module.exports = function(IoC, logger, settings) {

  var app = this

  // winston request logger before everything else
  // but only if it was enabled in settings
  if (settings.logger.requests)
    app.use(winstonRequestLogger.create(logger))

  // parse request bodies
  app.use(bodyParser.json())
  app.use(bodyParser.urlencoded({
    extended: true
  }))

  // support _method (PUT in forms etc)
  app.use(methodOverride('_method'))
  
  // suport liveReload
  if (settings.server.env === 'development') {
    app.use(require('connect-livereload')(settings.liveReload))
    logger.info('livereload server started at port ' + settings.liveReload.port)
  }

  // pagination
  app.use(paginate.middleware(10, 50))

}

exports['@require'] = [ '$container', 'igloo/logger', 'igloo/settings' ]
