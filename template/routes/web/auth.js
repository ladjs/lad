const Boom = require('boom');
const Router = require('koa-router');
const boolean = require('boolean');

const { passport, policies } = require('../../helpers');
const config = require('../../config');

const router = new Router({ prefix: '/auth' });

const catchError = async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (ctx.params.provider === 'google' && err.message === 'Consent required')
      return ctx.redirect('/auth/google/consent');
    ctx.flash('error', err.message);
    ctx.redirect('/login');
  }
};

router
  .param('provider', (provider, ctx, next) => {
    if (!boolean(process.env[`AUTH_${provider.toUpperCase()}_ENABLED`]))
      return ctx.throw(Boom.badRequest('Invalid provider'));
    return next();
  })
  .get('/:provider', policies.ensureLoggedOut, catchError, (ctx, next) =>
    passport.authenticate(ctx.params.provider, config.auth[ctx.params.provider])(ctx, next)
  )
  .get('/:provider/ok', policies.ensureLoggedOut, catchError, (ctx, next) => {
    const redirect = ctx.session.returnTo
      ? ctx.session.returnTo
      : `/${ctx.locale}${config.passportCallbackOptions.successReturnToOrRedirect}`;
    return passport.authenticate(ctx.params.provider, {
      ...config.passportCallbackOptions,
      successReturnToOrRedirect: redirect
    })(ctx, next);
  });

if (boolean(process.env.AUTH_GOOGLE_ENABLED))
  router.get(
    '/google/consent',
    policies.ensureLoggedOut,
    catchError,
    passport.authenticate('google', {
      accessType: 'offline',
      prompt: 'consent', // see google strategy in passport helper
      scope: []
    })
  );

module.exports = router;
