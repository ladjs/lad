const Boom = require('boom');
const Router = require('koa-router');

const { policies, passport } = require('../../helpers');
const config = require('../../config');

const router = new Router({
  prefix: '/auth'
});

router
  .param('provider', (provider, ctx, next) => {
    if (!config.auth.providers[provider]) return ctx.throw(Boom.badRequest('Invalid provider'));
    return next();
  })
  .get('/:provider', policies.ensureLoggedOut, config.auth.catchError, (ctx, next) =>
    passport.authenticate(ctx.params.provider, config.auth[ctx.params.provider])(ctx, next)
  )
  .get('/:provider/ok', policies.ensureLoggedOut, config.auth.catchError, (ctx, next) => {
    const redirect = ctx.session.returnTo
      ? ctx.session.returnTo
      : `/${ctx.req.locale}${config.auth.callbackOpts.successReturnToOrRedirect}`;
    return passport.authenticate(ctx.params.provider, {
      ...config.auth.callbackOpts,
      successReturnToOrRedirect: redirect
    })(ctx, next);
  });

if (config.auth.providers.google)
  router.get(
    '/google/consent',
    policies.ensureLoggedOut,
    config.auth.catchError,
    passport.authenticate('google', {
      accessType: 'offline',
      prompt: 'consent', // see google strategy in passport helper
      scope: config.auth.google.scope
    })
  );

module.exports = router;
