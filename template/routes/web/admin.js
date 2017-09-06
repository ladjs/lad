const Router = require('koa-router');

const { policies, renderPage } = require('../../helpers');

const router = new Router({
  prefix: '/admin'
});

router.use(policies.ensureAdmin);
router.get('/', renderPage('admin'));

module.exports = router;
