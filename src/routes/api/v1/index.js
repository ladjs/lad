
import Router from 'koa-router';

import { policies } from '../../../helpers';
import { api } from '../../../app/controllers';

const router = new Router({
  prefix: '/v1'
});

router
  .get('/account', policies.ensureApiToken, api.v1.users.retrieve)
  .put('/account', policies.ensureApiToken, api.v1.users.update)
  .get('/license-key/:key', api.v1.users.checkLicenseKey);

export default router;
