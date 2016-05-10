
import Router from 'koa-router';
import config from '../config';
import { renderPage, passport, policies } from '../helpers';
import { app } from '../app/controllers';

const router = new Router();

router
  .get('/', renderPage('home'))
  .get('/status', app.status)
  .get('/about', renderPage('about'))
  .get('/my-account', policies.ensureLoggedIn, renderPage('my-account'))
  .all('/admin*', policies.ensureAdmin)
  .get('/admin', renderPage('admin'))
  // TODO: add your routes here
  .get('/404', renderPage('404'))
  .get('/500', renderPage('500'))
  .get(
    '/logout',
    policies.ensureLoggedIn,
    ctx => {
      ctx.logout();
      ctx.redirect('/');
      return;
    }
  )
  .get(
    '/login',
    policies.ensureLoggedOut,
    config.auth.catchError,
    passport.authenticate('google', config.auth.google)
  )
  .get(
    '/login/consent',
    policies.ensureLoggedOut,
    config.auth.catchError,
    passport.authenticate('google', {
      accessType: 'offline',
      prompt: 'consent', // see google strategy in passport helper
      scope: config.auth.google.scope
    })
  )
  .get(
    '/login/ok',
    policies.ensureLoggedOut,
    config.auth.catchError,
    passport.authenticate('google', config.auth.callbackOpts)
  )
  .get(
    '/auth/:provider',
    policies.ensureLoggedIn,
    config.auth.catchError,
    (ctx, next) => passport.authenticate(
      ctx.params.provider,
      config.auth[ctx.params.provider]
    )(ctx, next)
  )
  .get(
    '/auth/:provider/ok',
    policies.ensureLoggedIn,
    config.auth.catchError,
    (ctx, next) => passport.authenticate(
      ctx.params.provider, config.auth.callbackOpts
    )(ctx, next)
  )
  .get('/signup', ctx => ctx.redirect('/login'));

export default router;
