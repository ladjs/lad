Error.stackTraceLimit = Infinity;
global.Promise = require('bluebird');

const Graceful = require('@ladjs/graceful');
const Web = require('@ladjs/web');
const maxListenersExceededWarning = require('max-listeners-exceeded-warning');
const mongoose = require('@ladjs/mongoose');

const config = require('./config');
const routes = require('./routes');
const { i18n, logger, passport } = require('./helpers');

if (config.env !== 'production') {
  maxListenersExceededWarning();
}

const web = new Web({
  routes: routes.web,
  logger,
  i18n,
  meta: config.meta,
  views: config.views,
  passport
});

if (!module.parent) {
  mongoose.configure({
    ...config.mongoose,
    logger
  });

  (async () => {
    try {
      await mongoose.connect();
      web.listen(process.env.WEB_PORT);
    } catch (err) {
      logger.error(err);
    }
  })();

  const graceful = new Graceful({ mongoose, server: web, logger });
  graceful.listen();
}

module.exports = web;
