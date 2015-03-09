
// # caching
var _ = require('underscore');
var _str = require('underscore.string');
var path = require('path');
var helmet = require('helmet');

_.mixin(_str.exports());

exports = module.exports = function(IoC) {
  return {
    getCachingHeadersFromSettings: function(settings){
      var maxAge = parseInt(settings.staticServer.maxAge);
      var headers = [];

      if(maxAge){
        headers.push({
          'key': 'Expires',
          'value': new Date(Date.now() + (maxAge * 1000)).toUTCString()
        });

        if(!settings.staticServer.skipCacheControl){
          var cacheControl = _.sprintf(
            "%s, max-age=%s",
            settings.staticServer.cacheControlPrivilege || 'public',
            settings.staticServer.maxAge
          );
          headers.push({
            'key': 'Cache-Control',
            'value': cacheControl
          });
        }
      }
      return headers;
    }
  };
};

exports['@require'] = [ '$container'];
