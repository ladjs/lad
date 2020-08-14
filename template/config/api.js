const sharedConfig = require('@ladjs/shared-config');

const i18n = require('../helpers/i18n');
const logger = require('../helpers/logger');
const passport = require('../helpers/passport');
const routes = require('../routes');

module.exports = {
  ...sharedConfig('API'),
  routes: routes.api,
  logger,
  i18n,
  passport
};
