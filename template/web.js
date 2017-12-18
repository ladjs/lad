#!/usr/bin/env node
const Server = require('@ladjs/web');
const Graceful = require('@ladjs/graceful');
const mongoose = require('@ladjs/mongoose');
const maxListenersExceededWarning = require('max-listeners-exceeded-warning');

const config = require('./config');
const routes = require('./routes');
const { i18n, logger, passport } = require('./helpers');

if (process.env.NODE_ENV !== 'production') maxListenersExceededWarning();

const server = new Server({
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

  mongoose
    .connect()
    .then(() => {
      server.listen(process.env.WEB_PORT);
    })
    .catch(logger.error);

  const graceful = new Graceful({ mongoose, server, logger });
  graceful.listen();
}

module.exports = server;
