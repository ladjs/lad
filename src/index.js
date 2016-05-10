
// babel requirements
import 'babel-polyfill';
import 'babel-regenerator-runtime';
import 'source-map-support/register';

// core node deps
import http from 'http';
import https from 'https';
import util from 'util';

// database
import mongoose from 'mongoose';

// main app
import Koa from 'koa';
import livereload from 'koa-livereload';
import logger from 'koa-logger';
import {
  dynamicViewHelpers,
  errorHandler,
  sentry,
  passport
} from './helpers';

// convert generator middleware to promise middleware
import convert from 'koa-convert';

// static asset revisioning and server
import koaManifestRev from 'koa-manifest-rev';
import serveStatic from 'koa-better-static';

// asset compression, gzipping, etagging, headers
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import compress from 'koa-compress';
import responseTime from 'koa-response-time';
import rateLimit from 'koa-ratelimit';

// view rendering
import views from 'koa-nunjucks-promise';
import bodyParser from 'koa-bodyparser';

// security
import helmet from 'koa-helmet';

// remove trailing slashes
import removeTrailingSlashes from 'koa-no-trailing-slash';

// sessions/authentication/messaging
import redis from 'redis';
import RedisStore from 'koa-redis';
import session from 'koa-generic-session';
import flash from 'koa-connect-flash';

// app routes and configuration
import config from './config';
import routes from './routes';

// create the database connection
mongoose.connect(config.mongodb);
mongoose.connection.on('connected', () => {
  app.emit('log', 'info', `mongoose connection open to ${config.mongodb}`);
});

// if the connection throws an error
mongoose.connection.on('error', err => {
  app.emit('error', err);
});

// when the connection is disconnected
mongoose.connection.on('disconnected', function () {
  app.emit('log', 'info', 'mongoose connection disconnected');
});

// initialize redis store
const redisClient = redis.createClient(config.redis);
redisClient.on('connect', () => app.emit('log', 'info', 'redis connected'));
redisClient.on('error', err => app.emit('error', err));

const redisStore = new RedisStore({
  client: redisClient
});

// initialize the app
const app = new Koa();

// store the server initialization
// so that we can gracefully exit
// later on with `server.close()`
let server;

// handle uncaught exceptions
process.on('uncaughtException', err => {
  /* eslint handle-callback-err: 0*/
  if (config.env === 'production')
    sentry.captureException(err);
  else if (config.showStack)
    console.log(util.inspect(err && err.stack || err, {
      colors: true,
      showHidden: true,
      depth: null
    }));
  else
    console.log(err.message);
  process.exit(1);
});

// handle graceful restarts
process.on('SIGTERM', () => {
  if (!server || !server.close)
    return process.exit(0);
  server.close((err) => {
    if (err) {
      app.emit('error', err);
      process.exit(1);
      return;
    }
    process.exit(0);
  });
});

app.on('error', (err, ctx) => {
  if (config.env === 'production')
    sentry.captureException(err);
  else if (config.showStack)
    console.log(util.inspect(err && err.stack || err, {
      colors: true,
      showHidden: true,
      depth: null
    }));
  else
    console.log(err.message);
});

// koa-manifest-rev
app.use(koaManifestRev(config.koaManifestRev));

// set nunjucks as rendering engine
app.use(views(
  config.viewsDir,
  config.nunjucks
));

// trust proxy
app.proxy = true;

// compress/gzip
app.use(compress());

// livereload if we're in dev mode
if (config.env === 'development')
  app.use(convert(livereload()));

// logging
app.use(logger());

// rate limiting
app.use(rateLimit(Object.assign(config.rateLimit, {
  db: redisStore.client
})));

// response time
app.use(convert(responseTime()));

// conditional-get
app.use(convert(conditional()));

// etag
app.use(convert(etag()));

// security
app.use(helmet());

// remove trailing slashes
app.use(convert(removeTrailingSlashes));

// serve static assets
app.use(convert(serveStatic(config.buildDir, config.serveStatic)));

// session store
app.keys = config.sessionKeys;
app.use(convert(session({
  store: redisStore
})));

// flash messages
app.use(convert(flash()));

// TODO: open source this as an add-on to `flash()`
// when I rewrite it for `koa@next` and also document my error handler
//
// override the `ctx.redirect` so that
// we save preserve any flash messages
// https://github.com/koajs/koa/blob/v2.x/lib/response.js#L234-L272
app.use(async (ctx, next) => {
  const _redirect = ctx.redirect;
  ctx.redirect = function redirect(url, alt) {
    Object.keys(ctx.state.flash).forEach((value) => {
      // unfortunately flash doesn't allow us to pass an array, so we iterate
      ctx.state.flash[value].forEach(message => {
        ctx.flash(value, message);
      });
    });
    _redirect.call(ctx, url, alt);
  };
  await next();
});

// body parser
app.use(bodyParser());
// https://github.com/koajs/bodyparser/issues/33
app.use(async function(ctx, next) {
  ctx.req.body = ctx.request.body;
  await next();
});

// auth
app.use(passport.initialize());
app.use(passport.session());

// add dynamic view helpers
app.use(dynamicViewHelpers);

// mount the app's defined and nested routes
app.use(routes.routes());

// override koa's undocumented error handler
app.context.onerror = errorHandler;

// custom 404 handler since it's not already built in
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404)
      ctx.throw(404);
  } catch (err) {
    ctx.app.emit('error', err, ctx);
  }
});

// start server on either http or https
if (config.protocol === 'http')
  server = http.createServer(app.callback());
else
  server = https.createServer(config.ssl, app.callback());

if (!module.parent)
  server = server.listen(
    config.port,
    () => console.log(`server listening on ${config.port}`)
  );

module.exports = server;
