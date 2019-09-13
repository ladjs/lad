const Mandarin = require('mandarin');

const { i18n, logger } = require('../helpers');

const mandarin = new Mandarin({ i18n, logger });

module.exports = async job => {
  await mandarin.translate(job.data);
};
