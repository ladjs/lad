const Agenda = require('agenda');
const _ = require('lodash');
const memwatch = require('memwatch-next');

const jobs = require('./jobs');
const { stopAgenda, Mongoose, logger, graceful } = require('./helpers');
const config = require('./config');

// Set up agenda
const agenda = new Agenda({
  name: config.agenda.name,
  maxConcurrency: config.agenda.maxConcurrency
});

// Initialize mongoose
const mongoose = new Mongoose(agenda);

// TODO: we need to test that if the mongoose connection
// disconnects and then reconnects, that this gets triggered
agenda.on('ready', () => {
  logger.info('agenda ready');

  // we cancel jobs here so we don't create duplicates
  // on every time the server restarts, or mongoose reconnects
  agenda.cancel(config.agendaCancelQuery, (err, numRemoved) => {
    // if there was an error then log it and stop agenda
    if (err) {
      logger.error(err);
      stopAgenda(agenda, err => {
        if (err) return logger.error(err);
        logger.info('stopped agenda due to issue with agenda cancel');
      });
      return;
    }

    logger.info(`cancelled ${numRemoved} jobs`);

    // Define all of our jobs
    _.each(jobs, _job => {
      agenda.define(..._job);
    });

    // TODO: I18n translation
    agenda.now('locales');

    // If we're in dev mode, translate every minute
    // TODO: convert this to watch script somehow
    // if (config.env === 'development')
    //   agenda.every('5 minutes', 'locales');

    // TODO: we may need to change the `lockLifetime` (default is 10 min)
    // <https://github.com/rschmukler/agenda#multiple-job-processors>

    // TODO: recurring jobs
    // agenda.every('day', 'do something');

    agenda.start();
  });
});

// Handle events emitted
agenda.on('start', job => logger.info(`job "${job.attrs.name}" started`));
agenda.on('complete', job => {
  logger.info(`job "${job.attrs.name}" completed`);
  // Manually handle garbage collection
  // <https://github.com/rschmukler/agenda/issues/129#issuecomment-108057837>
  memwatch.gc();
});
agenda.on('success', job => logger.info(`job "${job.attrs.name}" succeeded`));
agenda.on('fail', (err, job) => {
  err.message = `job "${job.attrs.name}" failed: ${err.message}`;
  logger.error(err, { extra: { job } });
});
agenda.on('error', logger.error);

// Handle process events and graceful restart
graceful(null, null, mongoose, agenda);

// TODO: handle !module.parent here

module.exports = agenda;
