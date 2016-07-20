
import Router from 'koa-router';
import config from '../config';
import { renderPage, passport, Policies } from '../helpers';
import { app, api } from '../app/controllers';

const router = new Router();

// api routes
router.get('/v1/users', Policies.ensureApiToken, api.v1.Users.retrieve);

// non-api routes
router
  .get('/', renderPage('home'))
  .get('/status', app.status)
  .get('/about', renderPage('about'))
  .get('/my-account', Policies.ensureLoggedIn, renderPage('my-account'))
  .all('/admin*', Policies.ensureAdmin)
  .get('/admin', renderPage('admin'))
  .get('/404', renderPage('404'))
  .get('/500', renderPage('500'))
  .get(
    '/logout',
    Policies.ensureLoggedIn,
    ctx => {
      ctx.logout();
      ctx.redirect('/');
      return;
    }
  )
  .get(
    '/login',
    Policies.ensureLoggedOut,
    config.auth.catchError,
    passport.authenticate('google', config.auth.google)
  )
  .get(
    '/login/consent',
    Policies.ensureLoggedOut,
    config.auth.catchError,
    passport.authenticate('google', {
      accessType: 'offline',
      prompt: 'consent', // see google strategy in passport helper
      scope: config.auth.google.scope
    })
  )
  .get(
    '/login/ok',
    Policies.ensureLoggedOut,
    config.auth.catchError,
    passport.authenticate('google', config.auth.callbackOpts)
  )
  .get(
    '/auth/:provider',
    Policies.ensureLoggedIn,
    config.auth.catchError,
    (ctx, next) => passport.authenticate(
      ctx.params.provider,
      config.auth[ctx.params.provider]
    )(ctx, next)
  )
  .get(
    '/auth/:provider/ok',
    Policies.ensureLoggedIn,
    config.auth.catchError,
    (ctx, next) => passport.authenticate(
      ctx.params.provider, config.auth.callbackOpts
    )(ctx, next)
  )
  .get('/signup', ctx => ctx.redirect('/login'));

export default router;
