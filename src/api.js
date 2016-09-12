
import 'source-map-support/register';

import http from 'http';
import https from 'https';
import mongoose from 'mongoose';
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
  _404Handler
} from './helpers';
import config from './config';
import routes from './routes';

// create the database connection
mongoose.set('debug', config.mongooseDebug);
// use native promises
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb);
// when the connection is connected
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
process.on('SIGTERM', async () => {
  if (!server || !server.close)
    return process.exit(0);
  // convert callbacks to promises
  server.close = promisify(server.close, server);
  redisClient.quit = promisify(redisClient.quit, redisClient);
  try {
    await server.close();
    await redisClient.quit();
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    app.emit('error', err);
    process.exit(1);
  }
});

module.exports = server;
