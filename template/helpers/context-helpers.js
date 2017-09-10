const _ = require('lodash');
const Logger = require('@ladjs/logger');

const config = require('../config');

const logger = new Logger();

module.exports = function(ctx, next) {
  // fix the IP if we're working locally
  if (_.isUndefined(ctx.req.ip) && config.env === 'development')
    ctx.req.ip = '127.0.0.1';

  // bind ctx.req.body to ctx.request.body
  // as a shortcut helper method
  // https://github.com/koajs/bodyparser/issues/33
  ctx.req.body = ctx.request.body;

  // TODO: this should automatically add
  // user and metadata to log meta object
  // bind logger
  ctx.logger = logger;

  return next();
};
