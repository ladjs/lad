const Router = require('koa-router');
const render = require('koa-views-render');

const { web } = require('../../app/controllers');
const { policies } = require('../../helpers');
const admin = require('./admin');
const auth = require('./auth');

const router = new Router({
  prefix: '/:locale'
});

router
  .get('/', render('home'))
  .get('/about', render('about'))
  .get('/my-account', policies.ensureLoggedIn, render('my-account'))
  .get('/404', render('404'))
  .get('/500', render('500'))
  .get('/terms', render('terms'))
  .get('/contact', render('contact'))
  .post('/contact', web.contact)
  .get('/forgot-password', render('forgot-password'))
  .post('/forgot-password', web.auth.forgotPassword)
  .get('/reset-password/:token', render('reset-password'))
  .post('/reset-password/:token', web.auth.resetPassword)
  .get('/logout', policies.ensureLoggedIn, web.auth.logout)
  .get('/login', policies.ensureLoggedOut, web.auth.signupOrLogin)
  .post('/login', policies.ensureLoggedOut, web.auth.login)
  .get('/signup', policies.ensureLoggedOut, web.auth.signupOrLogin)
  .post(
    '/signup',
    policies.ensureLoggedOut,
    web.auth.register
    // we handle `ctx.login` in the previous middleware
    // passport.authenticate('local', config.passportCallbackOptions)
  );

router.use(auth.routes());
router.use(admin.routes());

module.exports = router;
