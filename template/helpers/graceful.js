const async = require('async');

const stopAgenda = require('./stop-agenda');
const logger = require('./logger');

module.exports = function(server, redisClient, mongoose, agenda) {
  function shutDown() {
    // give it only 5 seconds to gracefully shut down
    setTimeout(() => {
      logger.error(new Error('graceful shutdown failed'));
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }, 5000);

    const arr = [];

    if (server) arr.push(server.close);

    if (redisClient) arr.push(redisClient.quit);

    if (mongoose) arr.push(mongoose.disconnect);

    if (agenda) arr.push(fn => stopAgenda(agenda, fn));

    async.parallel(async.reflectAll(arr), err => {
      // TODO: do we need to handle results arg?
      // <https://caolan.github.io/async/docs.html#reflectAll>
      if (err) {
        logger.error(err);
        // eslint-disable-next-line unicorn/no-process-exit
        process.exit(1);
        return;
      }
      logger.info('gracefully shut down');
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(0);
    });
  }

  // handle warnings
  process.on('warning', logger.warn);

  // handle uncaught promises
  process.on('unhandledRejection', logger.error);

  // handle uncaught exceptions
  process.on('uncaughtException', err => {
    logger.error(err);
    process.exit(1);
  });

  // handle graceful restarts
  process.on('SIGTERM', shutDown);
  process.on('SIGHUP', shutDown);
  process.on('SIGINT', shutDown);
};
