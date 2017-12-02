#!/usr/bin/env node
const Server = require('@ladjs/web');
const Graceful = require('@ladjs/graceful');
const mongoose = require('@ladjs/mongoose');

const config = require('./config');
const routes = require('./routes');
const { i18n, logger } = require('./helpers');
const { Users } = require('./app/models');

const server = new Server({
  Users,
  routes: routes.web,
  logger,
  i18n,
  meta: config.meta,
  views: config.views
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
