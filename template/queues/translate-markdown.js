const Mandarin = require('mandarin');

const { i18n, logger } = require('../helpers');

const mandarin = new Mandarin({ i18n, logger });

module.exports = async job => {
  try {
    logger.info('starting mandarin markdown translation', { job });
    await mandarin.markdown();
  } catch (err) {
    logger.error(err);
    throw err;
  }
};
