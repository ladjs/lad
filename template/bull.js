const cluster = require('cluster');
const os = require('os');

const Bull = require('@ladjs/bull');
const Graceful = require('@ladjs/graceful');
const pSeries = require('p-series');

const config = require('./config');
const queues = require('./queues');
const logger = require('./helpers/logger');

const cpus = os.cpus().length;

const bull = new Bull({
  logger,
  queues,
  queue: {
    prefix: `bull_${config.env}`
  }
});

if (!module.parent) {
  const graceful = new Graceful({
    bulls: [bull],
    logger
  });

  (async () => {
    try {
      //
      // <https://github.com/OptimalBits/bull#cluster-support>
      //
      // NOTE: we only want to create recurring jobs and empty existing
      // in master thread process, otherwise child workers would create collisions
      //
      // also we must wait to spawn child workers until empty() and add() is finished
      //
      if (cluster.isMaster) {
        const welcomeEmail = bull.queues.get('welcome-email');

        await Promise.all([
          (async () => {
            // <https://github.com/OptimalBits/bull/issues/870>
            const failedEmailJobs = await bull.queues.get('email').getFailed();
            await Promise.all(failedEmailJobs.map(job => job.retry()));
          })(),
          pSeries([() => welcomeEmail.empty(), () => welcomeEmail.add()])
        ]);

        cluster.on('online', worker => {
          logger.info('cluster worker online', { worker });
        });

        cluster.on('exit', (worker, code) => {
          logger.info('cluster worker exit', { worker, code });
        });

        // spawn child workers
        for (let i = 0; i < cpus - 1; i++) {
          cluster.fork();
        }
      }

      // start it up
      await Promise.all([bull.start(), graceful.listen()]);
      if (process.send) process.send('ready');
      logger.info('Lad bull queue started');
    } catch (err) {
      logger.error(err);
      // eslint-disable-next-line unicorn/no-process-exit
      process.exit(1);
    }
  })();
}

module.exports = bull;
