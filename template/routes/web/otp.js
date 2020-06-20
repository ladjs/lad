const Router = require('@koa/router');
const render = require('koa-views-render');

const policies = require('../../helpers/policies');
const web = require('../../app/controllers/web');
const config = require('../../config');

const router = new Router({ prefix: config.otpRoutePrefix });
router.use(policies.ensureLoggedIn);

router
  .get(config.otpRouteLoginPath, render('otp/login'))
  .post(config.otpRouteLoginPath, web.auth.loginOtp)
  .get('/setup', render('otp/setup'))
  .post('/setup', web.otp.setup)
  .post('/disable', web.otp.disable)
  .post('/recovery', web.otp.recovery)
  .get('/keys', render('otp/keys'))
  .post('/keys', web.auth.recoveryKey);

module.exports = router;
