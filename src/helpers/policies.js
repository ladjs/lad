
import _ from 'lodash';
import auth from 'basic-auth';
import Boom from 'boom';
import s from 'underscore.string';

import Users from '../app/models/user';
import config from '../config';

export default class Policies {

  static async ensureLoggedIn(ctx, next) {

    // a more simpler version that is adapted from
    // `koa-ensure-login` to use async/await
    // (this is adapted from the original `connect-ensure-login`)
    // <https://github.com/RobinQu/koa-ensure-login>
    // <https://github.com/jaredhanson/connect-ensure-login>

    if (!ctx.isAuthenticated()) {
      ctx.session.returnTo = ctx.originalUrl || ctx.req.url;
      ctx.redirect('/login');
      return;
    }

    await next();

  }

  static async ensureApiToken(ctx, next) {

    const credentials = auth(ctx.req);

    if (_.isUndefined(credentials)
      || !_.isString(credentials.name)
      || s.isBlank(credentials.name))
      return ctx.throw(Boom.unauthorized('Invalid creds', config.appName));

    const user = await Users.findOne({ api_token: credentials.name });

    if (!user)
      return ctx.throw(Boom.unauthorized('Invalid token', config.appName));

    ctx.req.logIn(user, { session: false });

    await next();

  }

  static async ensureLoggedOut(ctx, next) {
    if (ctx.isAuthenticated())
      return ctx.redirect('/');
    await next();
  }

  static async ensureAdmin(ctx, next) {
    if (!ctx.isAuthenticated() || ctx.req.user.group !== 'admin')
      return ctx.throw(Boom.unauthorized(
        'You do not belong to the "admin" user group'
      ));
    await next();
  }

}
