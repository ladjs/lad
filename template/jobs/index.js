// eslint-disable-next-line import/no-extraneous-dependencies
const Mandarin = require('mandarin');

const { i18n, logger } = require('../helpers');
const email = require('./email');

// [ name, agendaOptions, function ]
const jobs = [];
jobs.push(['email', {}, email]);

if (process.env.GOOGLE_TRANSLATE_KEY) {
  const mandarin = new Mandarin({ i18n, logger });
  jobs.push(['mandarin', {}, mandarin.translate]);
}

module.exports = jobs;
