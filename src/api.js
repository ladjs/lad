
import 'source-map-support/register';

import http from 'http';
import https from 'https';
import locale from 'koa-locale';
import i18n from 'koa-i18n-2';
import Koa from 'koa';
import convert from 'koa-convert';
import compress from 'koa-compress';
import responseTime from 'koa-response-time';
import rateLimit from 'koa-simple-ratelimit';
import logger from 'koa-logger';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import errorHandler from 'koa-better-error-handler';
import removeTrailingSlashes from 'koa-no-trailing-slash';
import redis from 'redis';
import promisify from 'es6-promisify';

import {
  Logger,
  contextHelpers,
  _404Handler,
  timeout,
  Mongoose,
  checkLicense,
  updateNotifier
} from './helpers';
import config from './config';
import routes from './routes';

// check for CrocodileJS license key
checkLicense();

// check for updates
updateNotifier();

// initialize mongoose
const mongoose = new Mongoose();

// connect to redis
const redisClient = redis.createClient(config.redis);
redisClient.on('connect', () => app.emit('log', 'info', 'redis connected'));
redisClient.on('error', err => app.emit('error', err));

// initialize the app
const app = new Koa();

// initialize localization
locale(app);

// store the server initialization
// so that we can gracefully exit
// later on with `server.close()`
let server;

app.on('error', Logger.ctxError);
app.on('log', Logger.log);

// setup localization
app.use(convert(i18n(app, {
  extension: '.json',
  directory: config.localesDirectory,
  locales: config.locales,
  modes: [ 'header' ]
})));

// trust proxy
app.proxy = true;

// compress/gzip
app.use(compress());

// override koa's undocumented error handler
app.context.onerror = errorHandler;

// response time
app.use(convert(responseTime()));

// add the logger for development environment only
if (config.env === 'development')
  app.use(logger());

// rate limiting
app.use(rateLimit({
  ...config.rateLimit,
  db: redisClient
}));

// remove trailing slashes
app.use(convert(removeTrailingSlashes));

// body parser
app.use(bodyParser());

// pretty-printed json responses
app.use(json());

// add context helpers
app.use(contextHelpers);

// configure timeout
app.use(async (ctx, next) => {
  try {
    await timeout(
      config.apiRequestTimeoutMs,
      ctx.translate('REQUEST_TIMED_OUT')
    )(ctx, next);
  } catch (err) {
    ctx.throw(err);
  }
});

// mount the app's defined and nested routes
app.use(routes.api.routes());

// custom 404 handler since it's not already built in
app.use(_404Handler);

// start server on either http or https
if (config.protocols.api === 'http')
  server = http.createServer(app.callback());
else
  server = https.createServer(config.ssl.api, app.callback());

if (!module.parent)
  server = server.listen(
    config.ports.api,
    () => Logger.info(`api server listening on ${config.ports.api}`)
  );

// handle uncaught promises
process.on('unhandledRejection', function (reason, p) {
  Logger.error(`unhandled promise rejection: ${reason}`, p);
  console.dir(p, { depth: null });
});

// handle uncaught exceptions
process.on('uncaughtException', err => {
  Logger.error(err);
  process.exit(1);
});

// handle graceful restarts
process.on('SIGTERM', graceful);
process.on('SIGHUP', graceful);
process.on('SIGINT', graceful);

async function graceful() {
  if (!server || !server.close)
    return process.exit(0);
  // give it only 5 seconds to gracefully shut down
  setTimeout(() => {
    throw new Error('agenda did not shut down after 5s');
  }, 5000);
  // convert callbacks to promises
  server.close = promisify(server.close, server);
  redisClient.quit = promisify(redisClient.quit, redisClient);
  try {
    await Promise.all([
      server.close,
      redisClient.quit,
      mongoose.disconnect
    ]);
    Logger.info('gracefully shut down');
    process.exit(0);
  } catch (err) {
    Logger.error(err);
    process.exit(1);
  }
}

module.exports = server;
