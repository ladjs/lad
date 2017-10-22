const _ = require('lodash');
const Logger = require('@ladjs/logger');
const config = require('../config');

const logger = new Logger(config.logger);

module.exports = function(ctx, next) {
  // fix the IP if we're working locally
  if (_.isUndefined(ctx.req.ip) && config.env === 'development') ctx.req.ip = '127.0.0.1';

  // TODO: this should automatically add
  // user and metadata to log meta object
  ctx.logger = logger;

  return next();
};
