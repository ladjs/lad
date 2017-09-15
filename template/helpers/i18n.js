const I18N = require('@ladjs/i18n');

const config = require('../config');
const logger = require('./logger');

const i18n = new I18N({
  ...config.i18n,
  logger
});

module.exports = i18n;
