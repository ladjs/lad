const http = require('http');
const https = require('https');
const _ = require('lodash');
const Boom = require('boom');
const Koa = require('koa');
const livereload = require('koa-livereload');
const favicon = require('koa-favicon');
const koaManifestRev = require('koa-manifest-rev');
const serve = require('koa-better-serve');
const conditional = require('koa-conditional-get');
const etag = require('koa-etag');
const compress = require('koa-compress');
const responseTime = require('koa-response-time');
const rateLimit = require('koa-simple-ratelimit');
const views = require('koa-views');
const logger = require('koa-logger');
const methodOverride = require('koa-methodoverride');
const bodyParser = require('koa-bodyparser');
const json = require('koa-json');
const errorHandler = require('koa-better-error-handler');
const helmet = require('koa-helmet');
const cors = require('kcors');
const removeTrailingSlashes = require('koa-no-trailing-slash');
const redis = require('redis');
const RedisStore = require('koa-redis');
const session = require('koa-generic-session');
const flash = require('koa-better-flash');
const CSRF = require('koa-csrf');
const StoreIPAddress = require('@ladjs/store-ip-address');
const isajax = require('koa-isajax');
// const Meta = require('koa-meta');
const Timeout = require('koa-better-timeout');
const Mongoose = require('@ladjs/mongoose');
const Graceful = require('@ladjs/graceful');

const config = require('./config');
const helpers = require('./helpers');
const routes = require('./routes');

const storeIPAddress = new StoreIPAddress({ logger: helpers.logger });
// const meta = new Meta(config.meta);

// initialize mongoose
const mongoose = new Mongoose({
  ...config.mongoose,
  logger: helpers.logger
}).mongoose;

// initialize the app
const app = new Koa();

// connect to redis
const redisClient = redis.createClient(config.redis);
// handle connect and error events
redisClient.on('connect', () => app.emit('log', 'info', 'redis connected'));
redisClient.on('error', err => app.emit('error', err));

// initialize redis store
const redisStore = new RedisStore({
  client: redisClient
});

// store the server initialization
// so that we can gracefully exit
// later on with `server.close()`
let server;

app.on('error', helpers.logger.contextError.bind(helpers.logger));
app.on('log', helpers.logger.log.bind(helpers.logger));

// trust proxy
app.proxy = true;

// compress/gzip
app.use(compress());

// favicons
app.use(favicon(config.favicon));

// serve static assets
app.use(serve(config.buildDir, config.serve));

// koa-manifest-rev
app.use(koaManifestRev(config.koaManifestRev));

// setup localization
app.use(helpers.i18n.middleware);

// set template rendering engine
app.use(
  views(config.views.root, _.extend(config.views.options, config.views.locals))
);

// livereload if we're in dev mode
if (config.env === 'development') app.use(livereload(config.livereload));

// override koa's undocumented error handler
app.context.onerror = errorHandler;

// response time
app.use(responseTime());

// add the logger for development environment only
// TODO: there's a weird logger issue, see this GH issue
// <https://github.com/koajs/logger/issues/49>
if (config.env === 'development') app.use(logger());

// rate limiting
app.use(
  rateLimit({
    ...config.rateLimit,
    db: redisClient
  })
);

// conditional-get
app.use(conditional());

// etag
app.use(etag());

// cors
app.use(cors(config.cors));

// TODO: add `cors-gate`
// <https://github.com/mixmaxhq/cors-gate/issues/6>

// security
app.use(helmet());

// remove trailing slashes
app.use(removeTrailingSlashes());

// session store
app.keys = config.sessionKeys;
app.use(session({ store: redisStore, key: config.cookiesKey }));

// flash messages
app.use(flash());

// method override
// (e.g. `<input type="hidden" name="_method" value="PUT" />`)
app.use(methodOverride());

// body parser
app.use(bodyParser());

// pretty-printed json responses
app.use(json());

// add context helpers
app.use(helpers.contextHelpers);

// ajax request detection (sets `ctx.state.xhr` boolean)
app.use(isajax());

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
  } catch (err) {
    let e = err;
    if (err.name && err.name === 'ForbiddenError') {
      e = Boom.forbidden(err.message);
      if (err.stack) e.stack = err.stack;
    }
    ctx.throw(e);
  }
});

// auth
app.use(helpers.passport.initialize());
app.use(helpers.passport.session());

// add dynamic view helpers
app.use(helpers.dynamicViewHelpers);

// add support for SEO <title> and <meta name="description">
// app.use(meta.middleware.bind(meta));
app.use((ctx, next) => {
  ctx.state.meta = { title: '', description: '' };
  return next();
});

// configure timeout
app.use(async (ctx, next) => {
  try {
    const timeout = new Timeout({
      ms: config.webRequestTimeoutMs,
      message: ctx.translate('REQUEST_TIMED_OUT')
    });
    await timeout.middleware(ctx, next);
  } catch (err) {
    ctx.throw(err);
  }
});

// detect or redirect based off locale url
app.use(helpers.i18n.redirect);

// store the user's last ip address in the background
app.use(storeIPAddress.middleware.bind(storeIPAddress));

// mount the app's defined and nested routes
app.use(routes.web.routes());

// start server on either http or https
if (config.protocols.web === 'http') server = http.createServer(app.callback());
else server = https.createServer(config.ssl.web, app.callback());

if (!module.parent)
  server = server.listen(config.ports.web, () =>
    helpers.logger.info(`web server listening on ${config.ports.web}`)
  );

// handle process events and graceful restart
const graceful = new Graceful({
  mongoose,
  server,
  redisClient,
  logger: helpers.logger
});
graceful.listen();

module.exports = server;
