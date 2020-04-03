const Router = require('@koa/router');
const render = require('koa-views-render');

const policies = require('../../helpers/policies');
const web = require('../../app/controllers/web');

const router = new Router({ prefix: '/my-account' });

router.use(policies.ensureLoggedIn);
router.use(policies.ensureOtp);
router.use(web.breadcrumbs);
router.get('/', render('my-account'));
router.put('/', web.myAccount.update);
router.delete('/security', web.myAccount.resetAPIToken);
router.get('/security', web.myAccount.security);
router.post('/setup-2fa', web.myAccount.setup2fa);
router.delete('/setup-2fa', web.myAccount.setup2fa);
router.post('/recovery-keys', web.myAccount.recoveryKeys);

module.exports = router;
