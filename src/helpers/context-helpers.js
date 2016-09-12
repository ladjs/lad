
import Boom from 'boom';
import config from '../config';
import _ from 'lodash';

export default function contextHelpers(ctx, next) {

  // bind `ctx.translate` as a helper func
  ctx.translate = function () {
    if (!_.isString(arguments[0]) || !_.isString(config.i18n[arguments[0]]))
      return ctx.throw(Boom.badRequest('Translation for your locale failed, try again'));
    arguments[0] = config.i18n[arguments[0]];
    return ctx.i18n.__(...arguments);
  };

  // bind ctx.req.body to ctx.request.body
  // as a shortcut helper method
  // https://github.com/koajs/bodyparser/issues/33
  ctx.req.body = ctx.request.body;

  return next();

}
