
import _ from 'lodash';
import auth from 'basic-auth';
import Boom from 'boom';
import s from 'underscore.string';

import { Users } from '../app/models';
import config from '../config';

export function ensureLoggedIn(ctx, next) {

  // a more simpler version that is adapted from
  // `koa-ensure-login` to use async/await
  // (this is adapted from the original `connect-ensure-login`)
  // <https://github.com/RobinQu/koa-ensure-login>
  // <https://github.com/jaredhanson/connect-ensure-login>

  if (!ctx.isAuthenticated()) {
    ctx.session.returnTo = ctx.originalUrl || ctx.req.url;
    if (!ctx.is('json'))
      ctx.flash('warning', ctx.translate('LOGIN_REQUIRED'));
    ctx.redirect('/login');
    return;
  }

  return next();

}

export async function ensureApiToken(ctx, next) {

  const credentials = auth(ctx.req);

  if (_.isUndefined(credentials)
    || !_.isString(credentials.name)
    || s.isBlank(credentials.name))
    return ctx.throw(Boom.unauthorized('Invalid creds', config.appName));

  const user = await Users.findOne({ api_token: credentials.name });

  if (!user)
    return ctx.throw(Boom.unauthorized('Invalid token', config.appName));

  ctx.req.logIn(user, { session: false });

  return next();

}

export async function ensureLoggedOut(ctx, next) {
  if (ctx.isAuthenticated())
    return ctx.redirect('/');
  await next();
}

export async function ensureAdmin(ctx, next) {
  if (!ctx.isAuthenticated() || ctx.state.user.group !== 'admin')
    return ctx.throw(Boom.unauthorized(
      'You do not belong to the "admin" user group'
    ));
  await next();
}
