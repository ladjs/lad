const graceful = require('./graceful');
const meta = require('./meta');
const timeout = require('./timeout');
const passport = require('./passport');
const dynamicViewHelpers = require('./dynamic-view-helpers');
const renderPage = require('./render-page');
const policies = require('./policies');
const logger = require('./logger');
const i18n = require('./i18n');
const _404Handler = require('./_404-handler');
const contextHelpers = require('./context-helpers');
const Mongoose = require('./mongoose');
const storeIPAddress = require('./store-ip-address');
const stopAgenda = require('./stop-agenda');

module.exports = {
  graceful,
  meta,
  timeout,
  passport,
  dynamicViewHelpers,
  renderPage,
  policies,
  logger,
  i18n,
  _404Handler,
  contextHelpers,
  Mongoose,
  storeIPAddress,
  stopAgenda
};
