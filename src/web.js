
import 'source-map-support/register';

import http from 'http';
import https from 'https';
import Boom from 'boom';
import locale from 'koa-locale';
import i18n from 'koa-i18n-2';
import Koa from 'koa';
import livereload from 'koa-livereload';
import convert from 'koa-convert';
import favicon from 'koa-favicon';
import koaManifestRev from 'koa-manifest-rev';
import serveStatic from 'koa-better-static';
import conditional from 'koa-conditional-get';
import etag from 'koa-etag';
import compress from 'koa-compress';
import responseTime from 'koa-response-time';
import rateLimit from 'koa-simple-ratelimit';
import logger from 'koa-logger';
import views from 'koa-nunjucks-next';
import methodOverride from 'koa-methodoverride';
import bodyParser from 'koa-bodyparser';
import json from 'koa-json';
import errorHandler from 'koa-better-error-handler';
import helmet from 'koa-helmet';
import removeTrailingSlashes from 'koa-no-trailing-slash';
import redis from 'redis';
import RedisStore from 'koa-redis';
import session from 'koa-generic-session';
import flash from 'koa-connect-flash';
import promisify from 'es6-promisify';
import CSRF from 'koa-csrf';

import config from './config';
import {
  dynamicViewHelpers,
  contextHelpers,
  passport,
  Logger,
  _404Handler,
  timeout,
  Mongoose,
  updateNotifier
} from './helpers';
import routes from './routes';

// check for updates
updateNotifier();

// initialize mongoose
const mongoose = new Mongoose();

// connect to redis
const redisClient = redis.createClient(config.redis);
redisClient.on('connect', () => app.emit('log', 'info', 'redis connected'));
redisClient.on('error', err => app.emit('error', err));

// initialize redis store
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

app.on('error', Logger.ctxError);
app.on('log', Logger.log);

// favicons
app.use(favicon(config.favicon));

// koa-manifest-rev
app.use(koaManifestRev(config.koaManifestRev));

// setup localization
app.use(convert(i18n(app, {
  extension: '.json',
  directory: config.localesDirectory,
  indent: '  ',
  locales: config.locales,
  modes: [ 'header' ]
})));

// set nunjucks as rendering engine
app.use(views(config.viewsDir, config.nunjucks));

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

// rate limiting
app.use(rateLimit({
  ...config.rateLimit,
  db: redisClient
}));

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
app.use(convert(session({ store: redisStore, key: config.cookiesKey })));

// flash messages
app.use(convert(flash()));

// method override (e.g. `input[type=_method]=PUT`
app.use(methodOverride());

// body parser
app.use(bodyParser());

// pretty-printed json responses
app.use(json());

// add context helpers (e.g. `ctx.translate`)
app.use(contextHelpers);

// custom 404 handler since it's not already built in
app.use(_404Handler);

// csrf (with added localization support)
app.use((ctx, next) => {
  // TODO: add cookies key until koa-better-error-handler issue is resolved
  // <https://github.com/koajs/generic-session/pull/95#issuecomment-246308544>
  ctx.state.cookiesKey = config.cookiesKey;
  return next();
});
app.use(async (ctx, next) => {
  try {
    await new CSRF({
      ...config.csrf,
      invalidSessionSecretMessage: ctx.translate('INVALID_SESSION_SECRET'),
      invalidTokenMessage: ctx.translate('INVALID_TOKEN')
    })(ctx, next);
  } catch (err) {
    ctx.throw(Boom.forbidden(err.message));
  }
});

// auth
app.use(passport.initialize());
app.use(passport.session());

// add dynamic view helpers
app.use(dynamicViewHelpers);

// configure timeout
app.use(async (ctx, next) => {
  try {
    await timeout(
      config.webRequestTimeoutMs,
      ctx.translate('REQUEST_TIMED_OUT')
    )(ctx, next);
  } catch (err) {
    ctx.throw(err);
  }
});

// mount the app's defined and nested routes
app.use(routes.web.routes());

// start server on either http or https
if (config.protocols.web === 'http')
  server = http.createServer(app.callback());
else
  server = https.createServer(config.ssl.web, app.callback());

if (!module.parent)
  server = server.listen(
    config.ports.web,
    () => Logger.info(`web server listening on ${config.ports.web}`)
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
