
import config from '../config';
import _ from 'lodash';

export default function contextHelpers(ctx, next) {

  // detect if we have an XHR request, inspired by:
  // <https://github.com/eightyfive/koa-request-xhr>
  ctx.xhr = ctx.req.xhr = ctx.get('X-Requested-With') === 'XMLHttpRequest';

  // fix the IP if we're working locally
  if (_.isUndefined(ctx.req.ip) && config.env === 'development')
    ctx.req.ip = '127.0.0.1';

  // bind ctx.req.body to ctx.request.body
  // as a shortcut helper method
  // https://github.com/koajs/bodyparser/issues/33
  ctx.req.body = ctx.request.body;

  return next();

}
