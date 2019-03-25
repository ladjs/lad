global.Promise = require('bluebird');

const Graceful = require('@ladjs/graceful');
const API = require('@ladjs/api');
const maxListenersExceededWarning = require('max-listeners-exceeded-warning');
const mongoose = require('@ladjs/mongoose');

const config = require('./config');
const routes = require('./routes');
const { i18n, logger, passport } = require('./helpers');

if (process.env.NODE_ENV !== 'production') maxListenersExceededWarning();

const api = new API({
  routes: routes.api,
  logger,
  i18n,
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
      api.listen(process.env.API_PORT);
    } catch (err) {
      logger.error(err);
    }
  })();

  const graceful = new Graceful({ mongoose, server: api, logger });
  graceful.listen();
}

module.exports = api;
