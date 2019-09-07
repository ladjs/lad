global.Promise = require('bluebird');

const Agenda = require('@ladjs/agenda');
const mongoose = require('@ladjs/mongoose');
const Graceful = require('@ladjs/graceful');
const maxListenersExceededWarning = require('max-listeners-exceeded-warning');

const jobs = require('./jobs');
const { logger } = require('./helpers');
const config = require('./config');

if (config.env !== 'production') maxListenersExceededWarning();

const agenda = new Agenda();
agenda.configure({
  logger,
  agendaJobDefinitions: jobs,
  agendaRecurringJobs: config.agendaRecurringJobs,
  agendaBootJobs: config.agendaBootJobs
});

if (!module.parent) {
  mongoose.configure({
    ...config.mongoose,
    logger,
    agenda
  });

  (async () => {
    try {
      await mongoose.connect();
      agenda.start();
    } catch (err) {
      logger.error(err);
    }
  })();

  const graceful = new Graceful({
    mongoose,
    agenda,
    logger
  });
  graceful.listen();
}

module.exports = agenda;
