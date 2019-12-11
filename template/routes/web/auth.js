const Boom = require('@hapi/boom');
const Router = require('@koa/router');
const { boolean } = require('boolean');

const passport = require('../../helpers/passport');
const policies = require('../../helpers/policies');
const config = require('../../config');
const web = require('../../app/controllers/web');

const router = new Router({ prefix: '/auth' });

router
  .param('provider', (provider, ctx, next) => {
    if (!boolean(process.env[`AUTH_${provider.toUpperCase()}_ENABLED`])) {
      return ctx.throw(Boom.badRequest(ctx.translate('INVALID_PROVIDER')));
    }

    return next();
  })
  .get(
    '/:provider',
    policies.ensureLoggedOut,
    web.auth.catchError,
    (ctx, next) =>
      passport.authenticate(
        ctx.params.provider,
        config.passport[ctx.params.provider]
      )(ctx, next)
  )
  .get(
    '/:provider/ok',
    policies.ensureLoggedOut,
    web.auth.catchError,
    (ctx, next) => {
      const redirect = ctx.session.returnTo
        ? ctx.session.returnTo
        : `/${ctx.locale}${config.passportCallbackOptions.successReturnToOrRedirect}`;
      return passport.authenticate(ctx.params.provider, {
        ...config.passportCallbackOptions,
        successReturnToOrRedirect: redirect
      })(ctx, next);
    }
  );

if (boolean(process.env.AUTH_GOOGLE_ENABLED)) {
  router.get(
    '/google/consent',
    policies.ensureLoggedOut,
    web.auth.catchError,
    passport.authenticate('google', {
      accessType: 'offline',
      prompt: 'consent', // See google strategy in passport helper
      scope: [
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ]
    })
  );
}

module.exports = router;
