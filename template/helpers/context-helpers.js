const _ = require('lodash');

const config = require('../config');
const { logger } = require('.');

module.exports = function(ctx, next) {
  // detect if we have an XHR request, inspired by:
  // <https://github.com/eightyfive/koa-request-xhr>
  ctx.req.xhr = ctx.get('X-Requested-With') === 'XMLHttpRequest';
  ctx.xhr = ctx.req.xhr;

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
