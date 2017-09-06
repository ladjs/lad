const _ = require('lodash');
const auth = require('basic-auth');
const Boom = require('boom');
const s = require('underscore.string');

const { Users } = require('../app/models');
const config = require('../config');

function ensureLoggedIn(ctx, next) {
  // a more simpler version that is adapted from
  // `koa-ensure-login` to use async/await
  // (this is adapted = require(the original `connect-ensure-login`)
  // <https://github.com/RobinQu/koa-ensure-login>
  // <https://github.com/jaredhanson/connect-ensure-login>

  if (!ctx.isAuthenticated()) {
    ctx.session.returnTo = ctx.originalUrl || ctx.req.url;
    if (!ctx.is('json')) ctx.flash('warning', ctx.translate('LOGIN_REQUIRED'));
    ctx.redirect('/login');
    return;
  }

  return next();
}

async function ensureApiToken(ctx, next) {
  const credentials = auth(ctx.req);

  if (
    _.isUndefined(credentials) ||
    !_.isString(credentials.name) ||
    s.isBlank(credentials.name)
  )
    return ctx.throw(Boom.unauthorized('Invalid creds', config.appName));

  const user = await Users.findOne({ api_token: credentials.name });

  if (!user)
    return ctx.throw(Boom.unauthorized('Invalid token', config.appName));

  await ctx.login(user, { session: false });

  return next();
}

async function ensureLoggedOut(ctx, next) {
  if (ctx.isAuthenticated()) return ctx.redirect('/');
  await next();
}

async function ensureAdmin(ctx, next) {
  if (!ctx.isAuthenticated() || ctx.state.user.group !== 'admin')
    return ctx.throw(
      Boom.unauthorized('You do not belong to the "admin" user group')
    );
  await next();
}

module.exports = {
  ensureLoggedIn,
  ensureApiToken,
  ensureLoggedOut,
  ensureAdmin
};
