const Router = require('@koa/router');

const { policies } = require('../../../helpers');
const { api } = require('../../../app/controllers');

const router = new Router({
  prefix: '/v1'
});

router.post('/account', api.v1.users.create);
router.get('/account', policies.ensureApiToken, api.v1.users.retrieve);
router.put('/account', policies.ensureApiToken, api.v1.users.update);

module.exports = router;
