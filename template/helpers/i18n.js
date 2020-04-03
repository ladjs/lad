const I18N = require('@ladjs/i18n');

const i18nConfig = require('../config/i18n');
const logger = require('./logger');

const i18n = new I18N({
  ...i18nConfig,
  logger
});

module.exports = i18n;
