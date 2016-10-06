
import 'source-map-support/register';

import http from 'http';
import https from 'https';
import Boom from 'boom';
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
import * as helpers from './helpers';
import routes from './routes';

// check for CrocodileJS license key
helpers.checkLicense();

// check for updates
helpers.updateNotifier();

// initialize mongoose
const mongoose = helpers.mongoose();

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

// store the server initialization
// so that we can gracefully exit
// later on with `server.close()`
let server;

app.on('error', helpers.logger.ctxError);
app.on('log', helpers.logger.log);

// trust proxy
app.proxy = true;

// compress/gzip
app.use(compress());

// favicons
app.use(favicon(config.favicon));

// serve static assets
app.use(convert(serveStatic(config.buildDir, config.serveStatic)));

// koa-manifest-rev
app.use(koaManifestRev(config.koaManifestRev));

// setup localization
app.use(helpers.i18n.middleware);

// set nunjucks as rendering engine
app.use(views(config.viewsDir, config.nunjucks));

// livereload if we're in dev mode
if (config.env === 'development')
  app.use(convert(livereload(config.livereload)));

// override koa's undocumented error handler
app.context.onerror = errorHandler;

// response time
app.use(convert(responseTime()));

// add the logger for development environment only
// TODO: there's a weird logger issue, see this GH issue
// <https://github.com/koajs/logger/issues/49>
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
app.use(helpers.contextHelpers);

// custom 404 handler since it's not already built in
app.use(helpers._404Handler);

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
  } catch (e) {
    let err = e;
    if (e.name && e.name === 'ForbiddenError') {
      err = Boom.forbidden(e.message);
      if (e.stack) err.stack = e.stack;
    }
    ctx.throw(err);
  }
});

// auth
app.use(helpers.passport.initialize());
app.use(helpers.passport.session());

// add dynamic view helpers
app.use(helpers.dynamicViewHelpers);

// configure timeout
app.use(async (ctx, next) => {
  try {
    await helpers.timeout(
      config.webRequestTimeoutMs,
      ctx.translate('REQUEST_TIMED_OUT')
    )(ctx, next);
  } catch (err) {
    ctx.throw(err);
  }
});

// detect or redirect based off locale url
app.use(helpers.i18n.redirect);

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
    () => helpers.logger.info(`web server listening on ${config.ports.web}`)
  );

// handle uncaught promises
process.on('unhandledRejection', function (reason, p) {
  helpers.logger.error(`unhandled promise rejection: ${reason}`, p);
  console.dir(p, { depth: null });
});

// handle uncaught exceptions
process.on('uncaughtException', err => {
  helpers.logger.error(err);
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
    helpers.logger.info('gracefully shut down');
    process.exit(0);
  } catch (err) {
    helpers.logger.error(err);
    process.exit(1);
  }
}

module.exports = server;
