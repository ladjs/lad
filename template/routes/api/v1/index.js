const Router = require('koa-router');

const { policies } = require('../../../helpers');
const { api } = require('../../../app/controllers');

const router = new Router({
  prefix: '/v1'
});

router
  .get('/account', policies.ensureApiToken, api.v1.users.retrieve)
  .put('/account', policies.ensureApiToken, api.v1.users.update);

module.exports = router;
