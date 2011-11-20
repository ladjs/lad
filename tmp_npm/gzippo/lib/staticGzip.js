/*!
 * Tom Gallacher
 *
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var fs = require('fs'),
		parse = require('url').parse,
		path = require('path'),
		mime = require('mime'),
		compress = require('compress'),
		staticSend;
try {
	staticSend = require('connect').static.send;
} catch (e) {
	staticSend = require('express').static.send;
}

/**
 * Strip `Content-*` headers from `res`.
 *
 * @param {ServerResponse} res
 * @api public
 */

var removeContentHeaders = function(res){
	Object.keys(res._headers).forEach(function(field){
		if (0 === field.indexOf('content')) {
			res.removeHeader(field);
		}
	});
};

/**
 * gzipped cache.
 */

var gzippoCache = {};

/**
 * gzip file.
 */

var gzippo = function(filename, charset, callback) {
	var gzip = new compress.Gzip();
	gzip.init();
	fs.readFile(filename, function (err, data) {
		if (err) throw err;
		var gzippedData = gzip.deflate(data, charset) + gzip.end();
		callback(gzippedData);
	});
};

/**
 * By default gzip's static's that match the given regular expression /text|javascript|json/
 * and then serves them with Connects static provider, denoted by the given `dirPath`.
 *
 * Options:
 *
 *	-	`maxAge`  cache-control max-age directive, defaulting to 1 day
 *	-	`clientMaxAge`  client cache-control max-age directive, defaulting to 1 week
 *	-	`contentTypeMatch` - A regular expression tested against the Content-Type header to determine whether the response
 *		should be gzipped or not. The default value is `/text|javascript|json/`.
 *	-	`prefix` - A url prefix. If you want all your static content in a root path such as /resource/. Any url paths not matching will be ignored
 *
 * Examples:
 *
 *     connect.createServer(
 *       connect.staticGzip(__dirname + '/public/');
 *     );
 *
 *     connect.createServer(
 *       connect.staticGzip(__dirname + '/public/', {maxAge: 86400000});
 *     );
 *
 * @param {String} path
 * @param {Object} options
 * @return {Function}
 * @api public
 */

exports = module.exports = function staticGzip(dirPath, options){
	options = options || {};
	var
		maxAge = options.maxAge || 86400000,
		contentTypeMatch = options.contentTypeMatch || /text|javascript|json/,
		clientMaxAge = options.clientMaxAge || 604800000,
		prefix = options.prefix || '';

	if (!dirPath) throw new Error('You need to provide the directory to your static content.');
	if (!contentTypeMatch.test) throw new Error('contentTypeMatch: must be a regular expression.');

  return function staticGzip(req, res, next){
		var url, filename, contentType, acceptEncoding, charset;

		function pass(name) {
			var o = Object.create(options);
			o.path = name;
			o.maxAge = maxAge;
			staticSend(req, res, next, o);
		}

		function setHeaders(cacheObj) {
			res.setHeader('Content-Type', contentType);
			res.setHeader('Content-Encoding', 'gzip');
			res.setHeader('Vary', 'Accept-Encoding');
			res.setHeader('Content-Length', cacheObj.content.length);
			res.setHeader('Last-Modified', cacheObj.mtime.toUTCString());
			res.setHeader('Date', new Date().toUTCString());
			res.setHeader('Expires', new Date(Date.now() + clientMaxAge).toUTCString());
			res.setHeader('Cache-Control', 'public, max-age=' + (clientMaxAge / 1000));
			res.setHeader('ETag', '"' + cacheObj.content.length + '-' + Number(cacheObj.mtime) + '"');
		}

		function sendGzipped(cacheObj) {
			setHeaders(cacheObj);
			res.end(cacheObj.content, 'binary');
		}

		function gzipAndSend(filename, gzipName, mtime) {
			gzippo(filename, charset, function(gzippedData) {
				gzippoCache[gzipName] = {
					'ctime': Date.now(),
					'mtime': mtime,
					'content': gzippedData
				};
				sendGzipped(gzippoCache[gzipName]);
			});
		}

		if (req.method !== 'GET' && req.method !== 'HEAD') {
			return next();
		}

		url = parse(req.url);

		// Allow a url path prefix
		if (url.pathname.substring(0, prefix.length) !== prefix) {
			return next();
		}

		filename = path.join(dirPath, url.pathname.substring(prefix.length));

		contentType = mime.lookup(filename);
		charset = mime.charsets.lookup(contentType, 'UTF-8');
		contentType = contentType + (charset ? '; charset=' + charset : '');
		acceptEncoding = req.headers['accept-encoding'] || '';

		if (!contentTypeMatch.test(contentType)) {
			return pass(filename);
		}

		if (!~acceptEncoding.indexOf('gzip')) {
			return pass(filename);
		}

		//This is storing in memory for the moment, need to think what the best way to do this.
		//Check file is not a directory

		fs.stat(filename, function(err, stat) {
			if (err || stat.isDirectory()) {
				return pass(filename);
			}

			var base = path.basename(filename),
					dir = path.dirname(filename),
					gzipName = path.join(dir, base + '.gz');

			if (req.headers['if-modified-since'] &&
				gzippoCache[gzipName] &&
				+stat.mtime <= new Date(req.headers['if-modified-since']).getTime()) {
				setHeaders(gzippoCache[gzipName]);
				removeContentHeaders(res);
				res.statusCode = 304;
				return res.end();
			}

			//TODO: check for pre-compressed file
			if (typeof gzippoCache[gzipName] === 'undefined') {
				gzipAndSend(filename, gzipName, stat.mtime);
			} else {
				if ((gzippoCache[gzipName].mtime < stat.mtime) ||
				((gzippoCache[gzipName].ctime + maxAge) < Date.now())) {
					gzipAndSend(filename, gzipName, stat.mtime);
				} else {
					sendGzipped(gzippoCache[gzipName]);
				}
			}
		});
	};
};
