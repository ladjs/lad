const Mandarin = require('mandarin');
const I18N = require('@ladjs/i18n');

const i18nConfig = require('../config/i18n');
const logger = require('../helpers/logger');

//
// NOTE: we want our own instance of i18n that does not auto reload files
//
const i18n = new I18N({
  ...i18nConfig,
  autoReload: false,
  updateFiles: false,
  syncFiles: false,
  logger
});

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
