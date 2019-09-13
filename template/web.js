const Graceful = require('@ladjs/graceful');
const Mongoose = require('@ladjs/mongoose');
const Web = require('@ladjs/web');
const _ = require('lodash');
const ip = require('ip');

const config = require('./config');
const routes = require('./routes');
const i18n = require('./helpers/i18n');
const logger = require('./helpers/logger');
const passport = require('./helpers/passport');

const web = new Web({
  routes: routes.web,
  logger,
  i18n,
  meta: config.meta,
  views: config.views,
  passport
});

if (!module.parent) {
  const mongoose = new Mongoose(
    _.merge({ logger }, web.config.mongoose, config.mongoose)
  );

  const graceful = new Graceful({
    mongooses: [mongoose],
    servers: [web],
    redisClients: [web.client],
    logger
  });

  (async () => {
    try {
      await Promise.all([
        mongoose.connect(),
        web.listen(web.config.port),
        graceful.listen()
      ]);
      if (process.send) process.send('ready');
      const { port } = web.server.address();
      logger.info(
        `Lad web server listening on ${port} (LAN: ${ip.address()}:${port})`
      );
      if (config.env === 'development')
        logger.info(
          `Please visit ${config.urls.web} in your browser for testing`
        );
    } catch (err) {
      logger.error(err);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  })();
}

module.exports = web;
