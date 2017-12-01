#!/usr/bin/env node
const Server = require('@ladjs/api');
const mongoose = require('@ladjs/mongoose');
const Graceful = require('@ladjs/graceful');

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
  routes: routes.api,
  logger,
  i18n
});
server.listen();

const graceful = new Graceful({ mongoose, server, logger });
graceful.listen();
