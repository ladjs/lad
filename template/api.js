#!/usr/bin/env node
const Server = require('@ladjs/api');
const Graceful = require('@ladjs/graceful');

const routes = require('./routes');
const { i18n, logger } = require('./helpers');
const { Users } = require('./app/models');

const server = new Server({
  Users,
  routes: routes.api,
  logger,
  i18n
});

if (!module.parent) {
  server.listen();
  const graceful = new Graceful({ server, logger });
  graceful.listen();
}

module.exports = server;
