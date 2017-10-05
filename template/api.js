#!/usr/bin/env node
const http = require('http');
const https = require('https');
const Koa = require('koa');
const compress = require('koa-compress');
const responseTime = require('koa-response-time');
const rateLimit = require('koa-simple-ratelimit');
const koaLogger = require('koa-logger');
const bodyParser = require('koa-bodyparser');
const koa404Handler = require('koa-404-handler');
const json = require('koa-json');
const errorHandler = require('koa-better-error-handler');
const removeTrailingSlashes = require('koa-no-trailing-slash');
const redis = require('redis');
const StoreIPAddress = require('@ladjs/store-ip-address');
const isajax = require('koa-isajax');
const Timeout = require('koa-better-timeout');
const Logger = require('@ladjs/logger');
const Graceful = require('@ladjs/graceful');
const Mongoose = require('@ladjs/mongoose');
const ip = require('ip');
const conditional = require('koa-conditional-get');
const cors = require('kcors');
const etag = require('koa-etag');
const helmet = require('koa-helmet');

const helpers = require('./helpers');
const config = require('./config');
const routes = require('./routes');

const logger = new Logger({
  ...helpers.logger.config
});
const storeIPAddress = new StoreIPAddress({ logger });

// initialize mongoose
const mongoose = new Mongoose({
  ...config.mongoose,
  logger
}).mongoose;

// connect to redis
const redisClient = redis.createClient(config.redis);
redisClient.on('connect', () => logger.info('redis connected'));
redisClient.on('error', logger.error);

// initialize the app
const app = new Koa();

// store the server initialization
// so that we can gracefully exit
// later on with `server.close()`
let server;

app.on('error', logger.contextError);
app.on('log', logger.log);

// setup localization
app.use(helpers.i18n.middleware);

// trust proxy
app.proxy = config.trustProxy;

// compress/gzip
app.use(compress());

// override koa's undocumented error handler
app.context.onerror = errorHandler;

// specify that this is our api (used by error handler)
app.context.api = true;

// response time
app.use(responseTime());

// add the logger for development environment only
if (config.env === 'development') app.use(koaLogger());

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

// body parser
app.use(bodyParser());

// pretty-printed json responses
app.use(json());

// add context helpers
app.use(helpers.contextHelpers);

// ajax request detection (sets `ctx.state.xhr` boolean)
app.use(isajax());

// auth
app.use(helpers.passport.initialize());

// configure timeout
app.use(async (ctx, next) => {
  try {
    const timeout = new Timeout({
      ms: config.apiRequestTimeoutMs,
      message: ctx.translate('REQUEST_TIMED_OUT')
    });
    await timeout.middleware(ctx, next);
  } catch (err) {
    ctx.throw(err);
  }
});

// store the user's last ip address in the background
app.use(storeIPAddress.middleware);

// mount the app's defined and nested routes
app.use(routes.api.routes());

// 404 handler
app.use(koa404Handler);

// start server on either http or https
if (config.protocols.api === 'http') server = http.createServer(app.callback());
else server = https.createServer(config.ssl.api, app.callback());

if (!module.parent)
  server = server.listen(config.ports.api, () =>
    logger.info(
      `api server listening on ${config.ports
        .api} (LAN: ${ip.address()}:${config.ports.api})`
    )
  );

// handle process events and graceful restart
const graceful = new Graceful({
  server,
  redisClient,
  mongoose,
  logger
});
graceful.listen();

module.exports = server;
