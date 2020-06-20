const config = require('.');
const cookieOptions = require('./cookies');
const env = require('./env');
const i18n = require('../helpers/i18n');
const logger = require('../helpers/logger');
const passport = require('../helpers/passport');
const routes = require('../routes');
const bull = require('../bull');
const koaCashConfig = require('./koa-cash');

module.exports = client => ({
  routes: routes.web,
  logger,
  i18n,
  cookies: cookieOptions,
  meta: config.meta,
  views: config.views,
  passport,
  koaCash: env.CACHE_RESPONSES ? koaCashConfig(client) : false,
  cacheResponses: env.CACHE_RESPONSES
    ? {
        routes: [
          '/css/(.*)',
          '/img/(.*)',
          '/js/(.*)',
          '/fonts/(.*)',
          '/browserconfig(.*)',
          '/robots(.*)',
          '/site(.*)',
          '/favicon(.*)'
        ]
      }
    : false,
  bull
});
