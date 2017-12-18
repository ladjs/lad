const Router = require('koa-router');
const render = require('koa-views-render');
const paginate = require('koa-ctx-paginate');

const { policies } = require('../../helpers');
const { web } = require('../../app/controllers');

const router = new Router({ prefix: '/admin' });

router.use(policies.ensureAdmin);
router.get('/', render('admin'));
router.get('/users', paginate.middleware(10, 50), web.admin.users.list);
router.put('/users', web.admin.users.update);
router.delete('/users', web.admin.users.remove);

module.exports = router;
