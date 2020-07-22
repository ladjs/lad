// eslint-disable-next-line import/no-unassigned-import
require('./config/env');

const Graceful = require('@ladjs/graceful');
const Mongoose = require('@ladjs/mongoose');
const Redis = require('@ladjs/redis');
const Web = require('@ladjs/web');
const ip = require('ip');
const sharedConfig = require('@ladjs/shared-config');

const config = require('./config');
const logger = require('./helpers/logger');
const webConfig = require('./config/web');

const webSharedConfig = sharedConfig('WEB');
const client = new Redis(webSharedConfig.redis, logger);
const web = new Web(webConfig(client));

if (!module.parent) {
  const mongoose = new Mongoose({ ...web.config.mongoose, logger });

  const graceful = new Graceful({
    mongooses: [mongoose],
    servers: [web],
    redisClients: [web.client, client],
    logger
  });
  graceful.listen();

  (async () => {
    try {
      await web.listen(web.config.port);
      if (process.send) process.send('ready');
      const { port } = web.server.address();
      logger.info(
        `Lad web server listening on ${port} (LAN: ${ip.address()}:${port})`
      );
      if (config.env === 'development')
        logger.info(
          `Please visit ${config.urls.web} in your browser for testing`
        );
      await mongoose.connect();
    } catch (err) {
      logger.error(err);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  })();
}

module.exports = web;
