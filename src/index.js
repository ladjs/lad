
// babel requirements
import 'babel-polyfill';
import 'source-map-support/register';

// ensure we have all necessary env variables
import dotenvSafe from 'dotenv-safe';
dotenvSafe.load();

// core node deps
import http from 'http';
import https from 'https';

// database
import mongoose from 'mongoose';

// locales
import locale from 'koa-locale';
import i18n from 'koa-i18n-2';

// main app
import Koa from 'koa';
import livereload from 'koa-livereload';
import {
  dynamicViewHelpers,
  errorHandler,
  passport,
  Logger,
  parseValidationError
} from './helpers';
import _ from 'lodash';
import Boom from 'boom';

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
// TODO: note that rateLimit has a bug
// import rateLimit from 'koa-ratelimit-promises';
import logger from 'koa-logger';

// view rendering
import views from 'koa-nunjucks-promise';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';

// security
import helmet from 'koa-helmet';

// remove trailing slashes
import removeTrailingSlashes from 'koa-no-trailing-slash';

// sessions/authentication/messaging
// import mongoStore from 'koa-session-mongo';
// import session from 'koa-session-store';
import redis from 'redis';
import RedisStore from 'koa-redis';
import session from 'koa-generic-session';
import flash from 'koa-connect-flash';

// app routes and configuration
import config from './config';
import routes from './routes';

// create the database connection
mongoose.set('debug', config.mongooseDebug);

// use native promises
mongoose.Promise = global.Promise;
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

// initialize localization
locale(app);

// store the server initialization
// so that we can gracefully exit
// later on with `server.close()`
let server;

// handle uncaught promises
process.on('unhandledRejection', function (reason, p) {
  Logger.error(`unhandled promise rejection: ${reason}`, p);
});

// handle uncaught exceptions
process.on('uncaughtException', err => {
  Logger.error(err);
  process.exit(1);
});

// handle graceful restarts
process.on('SIGTERM', () => {
  if (!server || !server.close)
    return process.exit(0);
  // TODO: I don't think server.close is working
  server.close(function (err) {
    if (err) {
      app.emit('error', err);
      process.exit(1);
      return;
    }
    /*
    redisClient.quit(err, res => {
      console.log('err', err, 'res', res);
      if (err) {
        app.emit('error', err);
        process.exit(1);
        return;
      }
    });
    */
    process.exit(0);
  });
});

app.on('error', Logger.ctxError);
app.on('log', Logger.log);

// koa-manifest-rev
app.use(koaManifestRev(config.koaManifestRev));

// setup localization
app.use(i18n(app, {
  extension: '.json',
  directory: config.localesDirectory,
  locales: config.locales,
  modes: [ 'header' ]
}));

// bind `ctx.translate` as a helper func
app.use(async function (ctx, next) {
  ctx.translate = function () {
    if (!_.isString(arguments[0]) || !_.isString(config.i18n[arguments[0]]))
      return ctx.throw('Translate failed');
    arguments[0] = config.i18n[arguments[0]];
    return ctx.i18n.__(...arguments);
  };
  await next();
});

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
  app.use(convert(livereload(config.livereload)));

// override koa's undocumented error handler
app.context.onerror = errorHandler;

// response time
app.use(convert(responseTime()));

// add the logger for development environment only
if (config.env === 'development')
  app.use(logger());

// convert boom errors into regular errors
// to be parsed easily throughout the app
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (e) {

    // parse mongoose validation errors
    const err = parseValidationError(e);

    // check if we have a boom error that specified
    // a status code already for us (and then use it)
    if (_.isObject(err.output) && _.isNumber(err.output.statusCode))
      err.status = err.output.statusCode;

    const type = ctx.accepts(['text', 'json', 'html']);

    if (!type) {
      err.status = 406;
      err.message = Boom.notAcceptable().output.payload;
    }

    if (!_.isNumber(err.status))
      err.status = 500;

    // set the ctx status to the error's status
    ctx.status = err.status;

    ctx.throw(err);

  }
});

// rate limiting
// app.use(rateLimit({
//   ...config.rateLimit,
//   db: redisStore.client
// }));

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
  // store: mongoStore.create({
  //   mongoose: mongoose.connection
  // })
  store: redisStore,
  key: config.cookiesKey
})));

// flash messages
app.use(convert(flash()));

// body parser
app.use(bodyParser());
// https://github.com/koajs/bodyparser/issues/33
app.use(async function(ctx, next) {
  ctx.req.body = ctx.request.body;
  await next();
});

// pretty-printed json responses
app.use(json());

// auth
app.use(passport.initialize());
app.use(passport.session());

// add dynamic view helpers
app.use(dynamicViewHelpers);

// mount the app's defined and nested routes
app.use(routes.routes());

// custom 404 handler since it's not already built in
app.use(async (ctx, next) => {
  try {
    await next();
    if (ctx.status === 404)
      ctx.throw(404);
  } catch (err) {
    ctx.throw(err);
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
    () => Logger.info(`server listening on ${config.port}`)
  );

module.exports = server;
