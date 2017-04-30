
import 'source-map-support/register';
import Agenda from 'agenda';
import promisify from 'es6-promisify';
import _ from 'lodash';
import memwatch from 'memwatch-next';

import * as jobs from './jobs';
import * as helpers from './helpers';
import config from './config';

// check for CrocodileJS license key
helpers.checkLicense();

// check for updates
helpers.updateNotifier();

// initialize mongoose
const mongoose = helpers.mongoose();

// when the connection is connected we need to override
// the default connection event, because agenda requires
// us to in order to connect with the same mongoose connection
mongoose.connection.on('connected', () => {
  // re-use existing mongoose connection
  // <https://github.com/rschmukler/agenda/issues/156#issuecomment-163700272>
  agenda.mongo(
    mongoose.connection.collection(config.agenda.collection).conn.db,
    config.agenda.collection,
    err => {
      if (err) return helpers.logger.error(err);
      helpers.logger.info('agenda opened connection using existing mongoose connection');
    }
  );
});

// similarly when disconnected, we need to ensure that we stop agenda
mongoose.connection.on('disconnected', async () => {
  if (agenda._collection) {
    cancel();
    try {
      await promisify(agenda.stop, agenda)();
    } catch (err) {
      helpers.logger.error(err);
    }
  }
});


// set up agenda

const cancelOptions = {
  repeatInterval: {
    $exists: true,
    $ne: null
  }
};

const agenda = new Agenda({
  name: config.agenda.name,
  maxConcurrency: config.agenda.maxConcurrency
});

agenda.on('ready', () => {

  helpers.logger.info('agenda ready');

  cancel();

  // define all of our jobs
  _.each(jobs.getJobs(), function (_job) {
    agenda.define(..._job);
  });

  // i18n translation
  agenda.now('locales');

  // if we're in dev mode, translate every minute
  // TODO: convert this to watch script somehow
  // if (config.env === 'development')
  //   agenda.every('5 minutes', 'locales');

  // TODO: we may need to change the `lockLifetime` (default is 10 min)
  // <https://github.com/rschmukler/agenda#multiple-job-processors>

  // TODO: recurring jobs
  // agenda.every('day', 'do something');

  agenda.start();

});

// handle events emitted
agenda.on('start', job => helpers.logger.info(`job "${job.attrs.name}" started`));
agenda.on('complete', job => {
  helpers.logger.info(`job "${job.attrs.name}" completed`);
  // manually handle garbage collection
  // <https://github.com/rschmukler/agenda/issues/129#issuecomment-108057837>
  memwatch.gc();
});
agenda.on('success', job => helpers.logger.info(`job "${job.attrs.name}" succeeded`));
agenda.on('fail', (err, job) => {
  err.message = `job "${job.attrs.name}" failed: ${err.message}`;
  helpers.logger.error(err, { extra: { job }});
});
agenda.on('error', helpers.logger.error);

// cancel recurring jobs so they get redefined on the next server start
// <http://goo.gl/nu1Rco>
async function cancel() {
  if (!agenda._collection) return helpers.logger.error('Collection did not exist');
  try {
    await promisify(agenda.cancel, agenda)(cancelOptions);
  } catch (err) {
    helpers.logger.error(err);
  }
}

// handle uncaught promises
process.on('unhandledRejection', function (reason, p) {
  helpers.logger.error(`unhandled promise rejection: ${reason}`, p);
  console.dir(p, { depth: null });
});

// handle uncaught exceptions
process.on('uncaughtException', err => {
  helpers.logger.error(err);
  process.exit(1);
});

// handle graceful restarts
process.on('SIGTERM', graceful);
process.on('SIGHUP', graceful);
process.on('SIGINT', graceful);

function graceful() {

  // stop accepting new jobs
  agenda.maxConcurrency(0);

  try {

    cancel();

    // give it only 5 seconds to gracefully shut down
    setTimeout(() => {
      throw new Error('agenda did not shut down after 5s');
    }, 5000);

    // check every second for jobs still running
    let jobInterval = setInterval(async () => {
      if (agenda._runningJobs.length > 0) {
        helpers.logger.info(`${agenda._runningJobs.length} jobs still running`);
      } else {
        clearInterval(jobInterval);
        jobInterval = null;
        if (agenda._collection)
          await promisify(agenda.stop, agenda)();
      }
    }, 500);

    setInterval(() => {
      if (!jobInterval) {
        helpers.logger.info('gracefully shut down');
        process.exit(0);
      }
    }, 500);

  } catch (err) {
    helpers.logger.error(err);
    throw err;
  }

}

module.exports = agenda;
