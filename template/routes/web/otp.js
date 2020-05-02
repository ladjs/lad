const Router = require('@koa/router');
const render = require('koa-views-render');

const policies = require('../../helpers/policies');
const web = require('../../app/controllers/web');

const router = new Router({ prefix: '/otp' });
router.use(policies.ensureLoggedIn);

router
  .get('/login', render('otp/login'))
  .post('/login', web.auth.loginOtp)
  .get('/keys', web.otp.renderKeys)
  .post('/keys', web.otp.keys)
  .get('/setup', web.otp.renderSetup)
  .post('/setup', web.otp.setup)
  .post('/disable', web.otp.disable)
  .post('/recovery', web.otp.recovery)
  .get('/recovery/verify', render('otp/verify'))
  .post('/recovery/verify', web.otp.verify)
  .get('/recovery/keys', render('otp/recovery'))
  .post('/recovery/keys', web.auth.recoveryKey);

module.exports = router;
