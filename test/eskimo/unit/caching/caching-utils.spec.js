var path = require('path');

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');

var assert = chai.assert;
var expect = chai.expect;

chai.should();
chai.use(sinonChai);

var basePath = path.join(__dirname, '..', '..', '..', '..');
var mocksPath = path.join(__dirname, '..', '..', '..', 'mocks', 'users');

var IoC = require('electrolyte');
//IoC.loader(IoC.node(path.join(basePath, 'app')));
IoC.loader(IoC.node(path.join(basePath, 'boot')));
IoC.loader('igloo', require('igloo'));
IoC.loader('utils', IoC.node(path.join(basePath, 'app', 'utils')));

var cachingUtils = IoC.create('utils/caching');

describe('caching-utils', function(){
  describe('getCachingHeadersFromSettings', function(){
    it("should return an empty array if caching max age is equals to 0", function(){

      var settings = {
        staticServer: {
          maxAge: 0
        }
      };

      var cacheHeaders = cachingUtils.getCachingHeadersFromSettings(settings);
      expect(cacheHeaders).deep.equal([]);

    });
    it("should return just Expires cache if skipCacheControl header is set to true", function(){

      var settings = {
        staticServer: {
          skipCacheControl: true,
          maxAgeInMilliseconds: 1000
        }
      };

      var cacheHeaders = cachingUtils.getCachingHeadersFromSettings(settings);
      expect(cacheHeaders).not.be.empty;
      expect(cacheHeaders.length).to.equal(1);
      var header = cacheHeaders[0];
      expect(header).have.keys(['key', 'value']);
      expect(header['key']).equal('Expires');
    });
    describe('when settings include Cache-Control headers, Cache-Control', function(){
      it("should be public by default", function(){

        var settings = {
          staticServer: {
            maxAgeInMilliseconds: 1000 * 1000
          }
        };

        var cacheHeaders = cachingUtils.getCachingHeadersFromSettings(settings);

        expect(cacheHeaders).not.be.empty;
        expect(cacheHeaders.length).to.equal(2);
        var header = cacheHeaders[1];

        expect(header).have.keys(['key', 'value']);
        expect(header['key']).equal('Cache-Control');
        expect(header['value']).equal('public, max-age=1000');
      });

      it("should be public if specified as so", function(){

        var settings = {
          staticServer: {
            maxAgeInMilliseconds: 1000 * 1000,
            cacheControlPrivilege: 'public'
          }
        };

        var cacheHeaders = cachingUtils.getCachingHeadersFromSettings(settings);

        expect(cacheHeaders).not.be.empty;
        expect(cacheHeaders.length).to.equal(2);
        var header = cacheHeaders[1];

        expect(header).have.keys(['key', 'value']);
        expect(header['key']).equal('Cache-Control');
        expect(header['value']).equal('public, max-age=1000');
      });
      it("should be private if specified as so", function(){

        var settings = {
          staticServer: {
            maxAgeInMilliseconds: 1000 * 1000,
            cacheControlPrivilege: 'private'
          }
        };

        var cacheHeaders = cachingUtils.getCachingHeadersFromSettings(settings);

        expect(cacheHeaders).not.be.empty;
        expect(cacheHeaders.length).to.equal(2);
        var header = cacheHeaders[1];

        expect(header).have.keys(['key', 'value']);
        expect(header['key']).equal('Cache-Control');
        expect(header['value']).equal('private, max-age=1000');
      });
    });

    describe('old legacy settings with maxAge', function(){
      it('should fall back to that setting if maxAgeInMilliseconds is not present', function(){
        var settings = {
          staticServer: {
            maxAge: 1000 * 1000,
            cacheControlPrivilege: 'private'
          }
        };

        var cacheHeaders = cachingUtils.getCachingHeadersFromSettings(settings);

        expect(cacheHeaders).not.be.empty;
        expect(cacheHeaders.length).to.equal(2);
        var header = cacheHeaders[1];

        expect(header).have.keys(['key', 'value']);
        expect(header['key']).equal('Cache-Control');
        expect(header['value']).equal('private, max-age=1000');
      });
      it('should prevail maxAgeInMilliseconds is both are present', function(){
        var settings = {
          staticServer: {
            maxAge: 1000 * 1000,
            maxAgeInMilliseconds: 9000 * 1000,
            cacheControlPrivilege: 'private'
          }
        };

        var cacheHeaders = cachingUtils.getCachingHeadersFromSettings(settings);

        expect(cacheHeaders).not.be.empty;
        expect(cacheHeaders.length).to.equal(2);
        var header = cacheHeaders[1];

        expect(header).have.keys(['key', 'value']);
        expect(header['key']).equal('Cache-Control');
        expect(header['value']).equal('private, max-age=9000');
      });
    });

  });
});
