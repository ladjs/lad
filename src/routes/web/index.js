
import Router from 'koa-router';

import controllers from '../../app/controllers';
import { renderPage, Policies, passport } from '../../helpers';
import admin from './admin';
import auth from './auth';
import config from '../../config';

const router = new Router();

router
  .get('/', controllers.web.home)
  .get('/about', renderPage('about'))
  .get('/status', controllers.web.status)
  .get('/my-account', Policies.ensureLoggedIn, renderPage('my-account'))
  .get('/404', renderPage('404'))
  .get('/500', renderPage('500'))
  .get('/terms', renderPage('terms'))
  .get('/contact', renderPage('contact'))
  .post('/contact', controllers.web.contact)
  .get('/forgot-password', renderPage('forgot-password'))
  .post('/forgot-password', controllers.web.forgotPassword)
  .get('/reset-password/:token', renderPage('reset-password'))
  .post('/reset-password/:token', controllers.web.resetPassword)
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
    controllers.web.signupOrLogin
  )
  .post(
    '/login',
    Policies.ensureLoggedOut,
    controllers.web.login
  )
  .get(
    '/signup',
    Policies.ensureLoggedOut,
    controllers.web.signupOrLogin
  )
  .post(
    '/signup',
    Policies.ensureLoggedOut,
    controllers.web.register,
    passport.authenticate('local', config.auth.callbackOpts)
  );

router.use(auth.routes());
router.use(admin.routes());

export default router;
