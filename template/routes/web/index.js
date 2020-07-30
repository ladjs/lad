const Router = require('@koa/router');
const render = require('koa-views-render');
const { boolean } = require('boolean');

const config = require('../../config');
const { policies } = require('../../helpers');
const { web } = require('../../app/controllers');
const { Users } = require('../../app/models');
const testUtils = require('../../test/utils');

const admin = require('./admin');
const auth = require('./auth');
const myAccount = require('./my-account');
const otp = require('./otp');

const router = new Router();

// report URI support (not locale specific)
router.post('/report', web.report);

const localeRouter = new Router({ prefix: '/:locale' });

localeRouter
  .get('/', web.auth.homeOrDashboard)
  .get(
    '/dashboard',
    policies.ensureLoggedIn,
    policies.ensureOtp,
    web.breadcrumbs,
    render('dashboard')
  )
  .get('/about', render('about'))
  .get('/404', render('404'))
  .get('/500', render('500'))
  .get('/terms', render('terms'))
  .get('/privacy', render('privacy'))
  .get('/support', render('support'))
  .post('/support', web.support)
  .get('/forgot-password', render('forgot-password'))
  .post('/forgot-password', web.auth.forgotPassword)
  .get('/reset-password/:token', render('reset-password'))
  .post('/reset-password/:token', web.auth.resetPassword)
  .get(
    config.verifyRoute,
    policies.ensureLoggedIn,
    web.auth.parseReturnOrRedirectTo,
    web.auth.verify
  )
  .post(
    config.verifyRoute,
    policies.ensureLoggedIn,
    web.auth.parseReturnOrRedirectTo,
    web.auth.verify
  )
  .get('/logout', web.auth.logout)
  .get(
    '/login',
    policies.ensureLoggedOut,
    web.auth.parseReturnOrRedirectTo,
    web.auth.registerOrLogin
  )
  .post('/login', policies.ensureLoggedOut, web.auth.login)
  .get(
    '/register',
    policies.ensureLoggedOut,
    web.auth.parseReturnOrRedirectTo,
    web.auth.registerOrLogin
  )
  .post('/register', policies.ensureLoggedOut, web.auth.register);

localeRouter.use(myAccount.routes());
localeRouter.use(admin.routes());

if (boolean(process.env.AUTH_OTP_ENABLED)) localeRouter.use(otp.routes());

router.use(auth.routes());
router.use(localeRouter.routes());

module.exports = router;
