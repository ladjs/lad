const Router = require('@koa/router');
const render = require('koa-views-render');

const policies = require('../../helpers/policies');
const web = require('../../app/controllers/web');

const router = new Router({ prefix: '/2fa' });
router.use(policies.ensureLoggedIn);

router
  .get('/otp/login', render('2fa/otp/login'))
  .post('/otp/login', web.auth.loginOtp)
  .get('/otp/keys', web.twoFactor.otp.renderKeys)
  .post('/otp/keys', web.twoFactor.otp.keys)
  .get('/otp/verify', web.twoFactor.otp.renderVerify)
  .post('/otp/verify', web.twoFactor.otp.verify)
  .post('/otp/disable', web.twoFactor.otp.disable)
  .post('/recovery', web.twoFactor.recovery.recover)
  .get('/recovery/verify', render('2fa/verify'))
  .post('/recovery/verify', web.twoFactor.recovery.verify)
  .get('/recovery/keys', render('2fa/otp/recovery'))
  .post('/recovery/keys', web.auth.recoveryKey);

module.exports = router;
