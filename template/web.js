#!/usr/bin/env node
const Server = require('@ladjs/web');
const Graceful = require('@ladjs/graceful');
const mongoose = require('@ladjs/mongoose');

const config = require('./config');
const routes = require('./routes');
const { i18n, logger } = require('./helpers');
const { Users } = require('./app/models');

mongoose.configure({
  ...config.mongoose,
  logger
});

mongoose
  .connect()
  .then()
  .catch(logger.error);

const server = new Server({
  Users,
  routes: routes.web,
  logger,
  i18n,
  meta: config.meta,
  views: config.views
});
server.listen();

const graceful = new Graceful({ mongoose, server, logger });
graceful.listen();
