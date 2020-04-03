const Router = require('@koa/router');
const render = require('koa-views-render');
const paginate = require('koa-ctx-paginate');

const policies = require('../../helpers/policies');
const web = require('../../app/controllers/web');

const router = new Router({ prefix: '/admin' });

router.use(policies.ensureAdmin);
router.use(policies.ensureOtp);
router.use(web.breadcrumbs);
router.get('/', render('admin'));
router.get('/users', paginate.middleware(10, 50), web.admin.users.list);
router.get('/users/:id', web.admin.users.retrieve);
router.put('/users/:id', web.admin.users.update);
router.post('/users/:id/login', web.admin.users.login);
router.delete('/users/:id', web.admin.users.remove);

module.exports = router;
