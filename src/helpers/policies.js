
import Boom from 'boom';

// a more simpler version that is adapted from
// `koa-ensure-login` to use async/await
// (this is adapted from the original `connect-ensure-login`)
// <https://github.com/RobinQu/koa-ensure-login>
// <https://github.com/jaredhanson/connect-ensure-login>

async function ensureLoggedIn(ctx, next) {

  if (!ctx.isAuthenticated()) {
    ctx.session.returnTo = ctx.originalUrl || ctx.req.url;
    ctx.redirect('/login');
    return;
  }

  await next();

}

async function ensureLoggedOut(ctx, next) {
  if (ctx.isAuthenticated())
    return ctx.redirect('/');
  await next();
}

async function ensureAdmin(ctx, next) {
  if (!ctx.isAuthenticated() || ctx.req.user.group !== 'admin')
    return ctx.throw(Boom.unauthorized(
      'You do not belong to the "admin" user group'
    ));
  await next();
}

export default {
  ensureLoggedIn,
  ensureLoggedOut,
  ensureAdmin
};
