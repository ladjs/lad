const Router = require('koa-router');
const render = require('koa-views-render');

const { policies } = require('../../helpers');

const router = new Router({
  prefix: '/admin'
});

router.use(policies.ensureAdmin);
router.get('/', render('admin'));

module.exports = router;
