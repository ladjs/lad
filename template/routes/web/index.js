const Router = require('koa-router');

const { web } = require('../../app/controllers');
const { renderPage, policies } = require('../../helpers');
const admin = require('./admin');
const auth = require('./auth');

const router = new Router({
  prefix: '/:locale'
});

router
  .get('/', renderPage('home'))
  .get('/about', renderPage('about'))
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
    web.auth.register
    // we handle `ctx.login` in the previous middleware
    // passport.authenticate('local', config.auth.callbackOpts)
  );

router.use(auth.routes());
router.use(admin.routes());

module.exports = router;
