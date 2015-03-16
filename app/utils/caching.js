
// # caching
var _ = require('underscore');
var _str = require('underscore.string');
var path = require('path');
var helmet = require('helmet');

_.mixin(_str.exports());

exports = module.exports = function(IoC) {
  return {
    getCachingHeadersFromSettings: function(settings) {
      var maxAgeInMilliseconds = (
        parseInt(settings.staticServer.maxAgeInMilliseconds, 10) ||
        parseInt(settings.staticServer.maxAge, 10)
      );
      var maxAgeInSeconds = parseInt(maxAgeInMilliseconds / 1000, 10);

      if(!maxAgeInMilliseconds) {
        return [];
      }

      var headers = [{
        'key': 'Expires',
        'value': new Date(Date.now() + maxAgeInMilliseconds).toUTCString()
      }];

      if(!settings.staticServer.skipCacheControl) {
        var cacheControl = _.sprintf(
          "%s, max-age=%s",
          settings.staticServer.cacheControlPrivilege || 'public',
          maxAgeInSeconds
        );
        headers.push({
          'key': 'Cache-Control',
          'value': cacheControl
        });
      }
      return headers;
    }
  };
};

exports['@require'] = [ '$container'];
