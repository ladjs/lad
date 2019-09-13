const API = require('@ladjs/api');
const Graceful = require('@ladjs/graceful');
const Mongoose = require('@ladjs/mongoose');
const _ = require('lodash');
const ip = require('ip');

const config = require('./config');
const routes = require('./routes');
const i18n = require('./helpers/i18n');
const logger = require('./helpers/logger');
const passport = require('./helpers/passport');

const api = new API({
  routes: routes.api,
  logger,
  i18n,
  passport
});

if (!module.parent) {
  const mongoose = new Mongoose(
    _.merge(
      {
        logger
      },
      api.config.mongoose,
      config.mongoose
    )
  );

  const graceful = new Graceful({
    mongooses: [mongoose],
    servers: [api],
    redisClients: [api.client],
    logger
  });

  (async () => {
    try {
      await Promise.all([
        mongoose.connect(),
        api.listen(api.config.port),
        graceful.listen()
      ]);
      if (process.send) process.send('ready');
      const { port } = api.server.address();
      logger.info(
        `Lad API server listening on ${port} (LAN: ${ip.address()}:${port})`
      );
    } catch (err) {
      logger.error(err);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  })();
}

module.exports = api;
