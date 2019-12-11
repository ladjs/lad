const Mandarin = require('mandarin');

const { i18n, logger } = require('../helpers');

const mandarin = new Mandarin({ i18n, logger });

module.exports = async job => {
  try {
    logger.info('starting mandarin translation', { job });
    await mandarin.translate();
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
