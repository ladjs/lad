const passport = require('./passport');
const dynamicViewHelpers = require('./dynamic-view-helpers');
const policies = require('./policies');
const i18n = require('./i18n');
const contextHelpers = require('./context-helpers');
const logger = require('./logger');

module.exports = {
  passport,
  dynamicViewHelpers,
  policies,
  logger,
  i18n,
  contextHelpers
};
