
import Router from 'koa-router';

import { web } from '../../app/controllers';
import { renderPage, policies, passport } from '../../helpers';
import admin from './admin';
import auth from './auth';
import gigs from './gigs';
import config from '../../config';

const router = new Router({
  prefix: '/:locale'
});

router
  .get('/', web.home)
  .get('/about', renderPage('about'))
  .get('/status', web.status)
  .post('/purchase-license', web.purchaseLicense)
  .get('/my-account', policies.ensureLoggedIn, renderPage('my-account'))
  .get('/404', renderPage('404'))
  .get('/500', renderPage('500'))
  .get('/terms', renderPage('terms'))
  .get('/contact', renderPage('contact'))
  .post('/contact', web.contact)
  .get('/forgot-password', renderPage('forgot-password'))
  .post('/forgot-password', web.auth.forgotPassword)
  .get('/reset-password/:token', renderPage('reset-password'))
  .post('/reset-password/:token', web.auth.resetPassword)
  .get('/logout', policies.ensureLoggedIn, web.auth.logout)
  .get('/login', policies.ensureLoggedOut, web.auth.signupOrLogin)
  .post('/login', policies.ensureLoggedOut, web.auth.login)
  .get('/signup', policies.ensureLoggedOut, web.auth.signupOrLogin)
  .post(
    '/signup',
    policies.ensureLoggedOut,
    web.auth.register,
    passport.authenticate('local', config.auth.callbackOpts)
  );

router.use(gigs.routes());
router.use(auth.routes());
router.use(admin.routes());

export default router;
