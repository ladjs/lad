const API = require('@ladjs/api');
const Graceful = require('@ladjs/graceful');
const Mongoose = require('@ladjs/mongoose');
const ip = require('ip');

const logger = require('./helpers/logger');
const apiConfig = require('./config/api');

const api = new API(apiConfig);

if (!module.parent) {
  const mongoose = new Mongoose({ ...api.config.mongoose, logger });

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
