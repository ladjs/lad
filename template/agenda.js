#!/usr/bin/env node
const Agenda = require('@ladjs/agenda');
const mongoose = require('@ladjs/mongoose');
const Graceful = require('@ladjs/graceful');
const maxListenersExceededWarning = require('max-listeners-exceeded-warning');

const jobs = require('./jobs');
const { logger } = require('./helpers');
const config = require('./config');

if (process.env.NODE_ENV !== 'production') maxListenersExceededWarning();

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

  mongoose
    .connect()
    .then(() => {
      agenda.start();
    })
    .catch(logger.error);

  const graceful = new Graceful({
    mongoose,
    agenda,
    logger
  });
  graceful.listen();
}

module.exports = agenda;
