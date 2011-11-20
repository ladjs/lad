
/**
 * Module dependencies.
 */

var staticProvider,
		assert = require('assert'),
		should = require('should'),
		http = require('http'),
		gzippo = require('../'),
		crypto = require('crypto'),
		fs = require('fs'),
		shasum = crypto.createHash('sha1');

try {
	staticProvider = require('connect');
} catch (e) {
	staticProvider = require('express');
}

/**
 * Path to ./test/fixtures/
 */

var fixturesPath = __dirname + '/fixtures';

var app = staticProvider.createServer(
	gzippo.staticGzip(fixturesPath)
);

module.exports = {
	'requesting gzipped json file succeeds': function() {
		assert.response(app,
			{
				url: '/user.json',
				headers: {
					'Accept-Encoding':"gzip"
				}
			},
			function(res){
				var gzippedData = res.body;
				assert.response(app, { url: '/user.gzip' }, function(res) {
					assert.equal(gzippedData, res.body, "Data is not gzipped");
				});

				res.statusCode.should.equal(200);
				res.headers.should.have.property('content-type', 'application/json; charset=UTF-8');
				res.headers.should.have.property('content-length', '69');
				res.headers.should.have.property('content-encoding', 'gzip');
			}
		);
	},
	'requesting gzipped js file succeeds': function() {
		assert.response(app,
			{
				url: '/test.js',
				headers: {
					'Accept-Encoding':"gzip"
				}
			},
			function(res){
				var gzippedData = res.body;
				assert.response(app, { url: '/test.js.gzip' }, function(res) {
					assert.equal(gzippedData, res.body, "Data is not gzipped");
				});

				res.statusCode.should.equal(200);
				res.headers.should.have.property('content-type', 'application/javascript; charset=UTF-8');
				res.headers.should.have.property('content-length', '35');
				res.headers.should.have.property('content-encoding', 'gzip');
			}
		);
	},
	'requesting js file without gzip succeeds': function() {
		assert.response(app,
			{
				url: '/test.js'
			},
			function(res){
				var gzippedData = res.body;

				fs.readFile(fixturesPath + '/test.js', function (err, data) {
					if (err) throw err;
					assert.equal(gzippedData, data, "Data returned does not match file data on filesystem");
				});

				res.statusCode.should.equal(200);
				res.headers.should.have.property('content-length', '15');
			}
		);
	},
	'requesting gzipped utf-8 file succeeds': function() {
		assert.response(app,
			{
				url: '/utf8.txt',
				headers: {
					'Accept-Encoding':"gzip"
				}
			},
			function(res){
				var gzippedData = res.body;
				assert.response(app, { url: '/utf8.txt.gz' }, function(res) {
					assert.equal(gzippedData, res.body, "Data is not gzipped");
				});

				res.statusCode.should.equal(200);
				res.headers.should.have.property('content-type', 'text/plain; charset=UTF-8');
				res.headers.should.have.property('content-length', '2031');
				res.headers.should.have.property('content-encoding', 'gzip');
			}
		);
	},
	'requesting gzipped utf-8 file returns 304': function() {
		assert.response(app,
			{
				url: '/utf8.txt',
				headers: {
					'Accept-Encoding': "gzip"
				}
			},
			function(res) {
				res.statusCode.should.equal(200);
				assert.response(app,
					{
						url: '/utf8.txt',
						headers: {
							'Accept-Encoding': "gzip",
							'If-Modified-Since': res.headers['last-modified']
						}
					},
					function(res2) {
						res2.statusCode.should.equal(304);
					}
				);
			}
		);
	},
	'requesting gzipped utf-8 file returns 200': function() {
		assert.response(app,
			{
				url: '/utf8.txt',
				headers: {
					'Accept-Encoding': "gzip"
				}
			},
			function(res) {
				res.statusCode.should.equal(200);
			}
		);
	},
	'ensuring max age is set on resources which are passed to the default static content provider': function() {
		assert.response(app,
			{
				url: '/tomg.co.png'
			},
			function(res) {
				res.headers.should.have.property('cache-control', 'public, max-age=86400');
			}
		);
	}
};
