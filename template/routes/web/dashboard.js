const Router = require('koa-router');
const render = require('koa-views-render');

const { policies } = require('../../helpers');

const router = new Router({ prefix: '/dashboard' });

router.use(policies.ensureLoggedIn);
router.get('/', render('dashboard'));

module.exports = router;
