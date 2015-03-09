
// # caching
var _ = require('underscore');
var _str = require('underscore.string');
var path = require('path');
var helmet = require('helmet');

_.mixin(_str.exports());

exports = module.exports = function(IoC, settings, logger, cachingUtils) {

  var app = this;

  // Disable cache if settings say so
  if (!settings.cache) {
    app.use(helmet.nocache());
    logger.info('HTTP caching is disabled');
  } else {
    logger.info('HTTP caching is enabled');

    app.use(function(req, res, next) {
      if (req.xhr) return next();

      // Enable cache if NOT an XHR (AJAX) request
      var headers = cachingUtils.getCachingHeadersFromSettings(settings);
      if(headers.length > 0){
        _.each(headers, function(header){
          res.setHeader(header['key'], header['value']);
        });
      }

      next();
    });
  }

};

exports['@require'] = [ '$container', 'igloo/settings', 'igloo/logger', 'utils/caching'];
