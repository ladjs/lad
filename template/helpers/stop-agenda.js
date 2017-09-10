const async = require('async');

const config = require('../config');
const { logger } = require('.');

module.exports = function(agenda, fn) {
  // stop accepting new jobs
  agenda.maxConcurrency(0);

  async.parallel(
    // TODO: do we need to handle results arg?
    // <https://caolan.github.io/async/docs.html#reflectAll>
    async.reflectAll([
      fn => {
        // cancel recurring jobs so they get redefined on next server start
        // TODO: once PR is accepted we can take this out
        // <https://github.com/agenda/agenda/pull/501>
        if (!agenda._collection)
          return fn(new Error('collection did not exist, see agenda#501'));

        agenda.cancel(config.agendaCancelQuery, (err, numRemoved) => {
          if (err) return fn(err);
          logger.info(`cancelled ${numRemoved} jobs`);
          fn();
        });
      },
      fn => {
        // check every 500ms for jobs still running
        const jobInterval = setInterval(async () => {
          if (agenda._runningJobs.length > 0) {
            logger.info(`${agenda._runningJobs.length} jobs still running`);
          } else {
            clearInterval(jobInterval);
            // cancel recurring jobs so they get redefined on next server start
            // TODO: once PR is accepted we can take this out
            // <https://github.com/agenda/agenda/pull/501>
            if (!agenda._collection)
              return fn(new Error('collection did not exist, see agenda#501'));
            agenda.stop(fn);
          }
        }, 500);
      }
    ]),
    fn
  );
};
