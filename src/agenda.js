
import 'source-map-support/register';

import Agenda from 'agenda';
import promisify from 'es6-promisify';
import _ from 'lodash';

import Jobs from './jobs';
import { Logger } from './helpers/';
import config from './config/';

// database
import mongoose from 'mongoose';

// create the database connection
if (config.env === 'development')
  mongoose.set('debug', true);
// use native promises
mongoose.Promise = global.Promise;
mongoose.connect(config.mongodb);
mongoose.connection.on('connected', () => {
  Logger.info(`mongoose connection open to ${config.mongodb}`);
});

// if the connection throws an error
mongoose.connection.on('error', err => {
  Logger.error(err);
});

// when the connection is disconnected
mongoose.connection.on('disconnected', function () {
  Logger.info('mongoose connection disconnected');
});

const Job = new Jobs();

const agenda = new Agenda(config.agenda);
const cancelOptions = {
  repeatInterval: {
    $exists: true,
    $ne: null
  }
};

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

agenda.on('start', job =>
  Logger.info(`job "${job.attrs.name}" started`));

agenda.on('complete', job =>
  Logger.info(`job "${job.attrs.name}" completed`));

agenda.on('success', job =>
  Logger.info(`job "${job.attrs.name}" succeeded`));

agenda.on('fail', (err, job) => {
  err.message = `job "${job.attrs.name}" failed: ${err.message}`;
  Logger.error(err, { extra: { job }});
});

agenda.on('error', Logger.error);

// cancel recurring jobs so they get redefined on the next server start
// <http://goo.gl/nu1Rco>
async function cancel() {
  try {
    await promisify(agenda.cancel, agenda)(cancelOptions);
  } catch (err) {
    throw err;
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

  Logger.warn('agenda gracefully shutting down');

  // stop accepting new jobs
  agenda.maxConcurrency(0);

  try {

    cancel();

    // give it only 5 seconds to finish the apn and job shutdown
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
        await promisify(agenda.stop, agenda)();
      }
    }, 500);

    setInterval(() => {
      if (!jobInterval)
        process.exit(0);
    }, 500);

  } catch (err) {
    Logger.error(err);
    throw err;
  }

}

module.exports = agenda;
