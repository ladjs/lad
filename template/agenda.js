#!/usr/bin/env node
const Agenda = require('@ladjs/agenda');
const mongoose = require('@ladjs/mongoose');
const Graceful = require('@ladjs/graceful');

const jobs = require('./jobs');
const { logger } = require('./helpers');
const config = require('./config');

const agenda = new Agenda();
agenda.configure({
  logger,
  agendaJobDefinitions: jobs,
  agendaRecurringJobs: config.agendaRecurringJobs,
  agendaBootJobs: config.agendaBootJobs
});

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
