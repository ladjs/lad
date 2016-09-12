
import Boom from 'boom';
import Router from 'koa-router';

import { Policies, passport } from '../../helpers';
import config from '../../config';

const router = new Router({
  prefix: '/auth'
});

router
  .param('provider', async (provider, ctx, next) => {
    if (!config.auth.providers[provider])
      return await ctx.throw(Boom.badRequest('Invalid provider'));
    await next();
  })
  .get(
    '/:provider',
    Policies.ensureLoggedOut,
    config.auth.catchError,
    (ctx, next) => passport.authenticate(
      ctx.params.provider,
      config.auth[ctx.params.provider]
    )(ctx, next)
  )
  .get(
    '/:provider/ok',
    Policies.ensureLoggedOut,
    config.auth.catchError,
    (ctx, next) => passport.authenticate(
      ctx.params.provider, config.auth.callbackOpts
    )(ctx, next)
  );

if (config.auth.providers.google)
  router.get(
    '/google/consent',
    Policies.ensureLoggedOut,
    config.auth.catchError,
    passport.authenticate('google', {
      accessType: 'offline',
      prompt: 'consent', // see google strategy in passport helper
      scope: config.auth.google.scope
    })
  );

export default router;
