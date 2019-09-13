const Router = require('@koa/router');

const policies = require('../../../helpers/policies');
const api = require('../../../app/controllers/api');

const router = new Router({
  prefix: '/v1'
});

router.post('/log', api.v1.log.checkToken, api.v1.log.parseLog);
router.post('/account', api.v1.users.create);
router.get('/account', policies.ensureApiToken, api.v1.users.retrieve);
router.put('/account', policies.ensureApiToken, api.v1.users.update);

module.exports = router;
