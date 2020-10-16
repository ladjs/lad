const Router = require('@koa/router');
const render = require('koa-views-render');

const policies = require('../../helpers/policies');
const web = require('../../app/controllers/web');

const router = new Router({ prefix: '/my-account' });

router.use(policies.ensureLoggedIn);
router.use(policies.ensureOtp);
router.use(web.breadcrumbs);
router.get('/', (ctx) => {
  ctx.redirect(ctx.state.l('/my-account/profile'));
});
router.put('/', web.myAccount.update);
router.get('/change-email/:token', render('change-email'));
router.post('/change-email/:token', web.auth.changeEmail);
router.get('/profile', render('my-account/profile'));
router.put('/profile', web.myAccount.update);
router.delete('/security', web.myAccount.resetAPIToken);
router.get('/security', render('my-account/security'));
router.post('/recovery-keys', web.myAccount.recoveryKeys);

module.exports = router;
