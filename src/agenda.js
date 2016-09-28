
import 'source-map-support/register';
import Agenda from 'agenda';
import promisify from 'es6-promisify';
import _ from 'lodash';

import Jobs from './jobs';
import {
  Mongoose,
  Logger,
  checkLicense,
  updateNotifier
} from './helpers/';
import config from './config/';

// check for CrocodileJS license key
checkLicense();

// check for updates
updateNotifier();

const Job = new Jobs();

// initialize mongoose
const mongoose = new Mongoose();

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
      if (err) return Logger.error(err);
      Logger.info('agenda opened connection using existing mongoose connection');
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
      Logger.error(err);
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

  Logger.info('agenda ready');

  cancel();

  // define all of our jobs
  _.each(Job.getJobs(), function (job) {
    job[2] = job[2].bind(Job);
    agenda.define(...job);
  });

  agenda.now('locales');

  // TODO: we may need to change the `lockLifetime` (default is 10 min)
  // <https://github.com/rschmukler/agenda#multiple-job-processors>

  // TODO: recurring jobs
  // agenda.every('day', 'do something');

  agenda.start();

});

// handle events emitted
agenda.on('start', job => Logger.info(`job "${job.attrs.name}" started`));
agenda.on('complete', job => Logger.info(`job "${job.attrs.name}" completed`));
agenda.on('success', job => Logger.info(`job "${job.attrs.name}" succeeded`));
agenda.on('fail', (err, job) => {
  err.message = `job "${job.attrs.name}" failed: ${err.message}`;
  Logger.error(err, { extra: { job }});
});
agenda.on('error', Logger.error);

// cancel recurring jobs so they get redefined on the next server start
// <http://goo.gl/nu1Rco>
async function cancel() {
  if (!agenda._collection) return Logger.error('Collection did not exist');
  try {
    await promisify(agenda.cancel, agenda)(cancelOptions);
  } catch (err) {
    Logger.error(err);
  }
}

// handle uncaught promises
process.on('unhandledRejection', function (reason, p) {
  Logger.error(`unhandled promise rejection: ${reason}`, p);
  console.dir(p, { depth: null });
});

// handle uncaught exceptions
process.on('uncaughtException', err => {
  Logger.error(err);
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
        Logger.info(`${agenda._runningJobs.length} jobs still running`);
      } else {
        clearInterval(jobInterval);
        jobInterval = null;
        if (agenda._collection)
          await promisify(agenda.stop, agenda)();
      }
    }, 500);

    setInterval(() => {
      if (!jobInterval) {
        Logger.info('gracefully shut down');
        process.exit(0);
      }
    }, 500);

  } catch (err) {
    Logger.error(err);
    throw err;
  }

}

module.exports = agenda;
