const passport = require('./passport');
const dynamicViewHelpers = require('./dynamic-view-helpers');
const policies = require('./policies');
const contextHelpers = require('./context-helpers');
const logger = require('./logger');
const i18n = require('./i18n');

module.exports = {
  passport,
  dynamicViewHelpers,
  policies,
  logger,
  contextHelpers,
  i18n
};
