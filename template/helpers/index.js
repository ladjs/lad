const passport = require('./passport');
const dynamicViewHelpers = require('./dynamic-view-helpers');
const policies = require('./policies');
const i18n = require('./i18n');
const _404Handler = require('./_404-handler');
const contextHelpers = require('./context-helpers');
const logger = require('./logger');

module.exports = {
  passport,
  dynamicViewHelpers,
  policies,
  logger,
  i18n,
  _404Handler,
  contextHelpers
};
