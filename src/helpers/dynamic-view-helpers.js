
import _ from 'lodash';
import s from 'underscore.string';
import config from '../config';
import moment from 'moment';

export default async function dynamicViewHelpers(ctx, next) {

  // add lodash in case we need it
  ctx.state._ = _;

  // add underscore.string in case we need it
  ctx.state.s = s;

  // allow config to render in views (be careful)
  ctx.state.config = config;

  // add moment
  ctx.state.moment = moment;

  // bind meta tag information
  ctx.state = _.merge(ctx.state, config.meta['/']);
  if (config.meta[ctx.path])
    ctx.state = _.merge(ctx.state, config.meta[ctx.path]);

  // add `user` object to the state for views
  if (ctx.isAuthenticated())
    ctx.state.user = ctx.req.user.toObject();

  // add `req` object to the state for views
  ctx.state.req = ctx.req;

  // add flash messages to state
  ctx.state.flash = function () {
    if (!_.some(ctx.session.flash, messages => messages.length > 0))
      return [];
    return {
      success: ctx.flash('success'),
      error: ctx.flash('error'),
      info: ctx.flash('info'),
      warning: ctx.flash('warning')
    };
  };

  await next();

};
