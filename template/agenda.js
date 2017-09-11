const Agenda = require('agenda');
const _ = require('lodash');
const memwatch = require('memwatch-next');
const stopAgenda = require('stop-agenda');
const Mongoose = require('@ladjs/mongoose');
const Graceful = require('@ladjs/graceful');

const jobs = require('./jobs');
const { logger } = require('./helpers');
const config = require('./config');

// Set up agenda
const agenda = new Agenda(config.agenda);

// Initialize mongoose and agenda
// Handles connection/disconnection/reconnection
const mongoose = new Mongoose({
  ...config.mongoose,
  logger,
  agenda,
  agendaCollectionName: config.agendaCollectionName,
  agendaRecurringJobs: config.agendaRecurringJobs
}).mongoose;

agenda.on('ready', () => {
  logger.debug('agenda ready');

  // we cancel jobs here so we don't create duplicates
  // on every time the server restarts, or mongoose reconnects
  // (even though `agenda.every` uses single, just to be safe)
  //
  // note that the core reason we have this is because
  // during development we may remove recurring jobs
  // and define new ones, therefore we don't want the old ones to run
  agenda.cancel(config.agendaCancelQuery, (err, numRemoved) => {
    // if there was an error then log it and stop agenda
    if (err) {
      logger.error(err);
      stopAgenda(agenda)
        .then()
        .catch(err => {
          if (err) return logger.error(err);
          logger.debug('stopped agenda due to issue with agenda cancel');
        });
      return;
    }

    logger.debug(`cancelled ${numRemoved} jobs`);

    // Define all of our jobs
    _.each(jobs, _job => {
      agenda.define(..._job);
    });

    agenda.now('locales');

    agenda.start();
  });
});

// Handle events emitted
agenda.on('start', job => logger.debug(`job "${job.attrs.name}" started`));
agenda.on('complete', job => {
  logger.debug(`job "${job.attrs.name}" completed`);
  // Manually handle garbage collection
  // <https://github.com/rschmukler/agenda/issues/129#issuecomment-108057837>
  memwatch.gc();
});
agenda.on('success', job => logger.debug(`job "${job.attrs.name}" succeeded`));
agenda.on('fail', (err, job) => {
  err.message = `job "${job.attrs.name}" failed: ${err.message}`;
  logger.error(err, { extra: { job } });
});
agenda.on('error', logger.error.bind(logger));

// handle process events and graceful restart
const graceful = new Graceful({
  mongoose,
  agenda,
  logger
});
graceful.listen();

module.exports = agenda;
