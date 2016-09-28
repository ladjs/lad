
import Router from 'koa-router';

import { Policies } from '../../../helpers';
import controllers from '../../../app/controllers';

const router = new Router({
  prefix: '/v1'
});

router
  .get('/account', Policies.ensureApiToken, controllers.api.v1.Users.retrieve)
  .put('/account', Policies.ensureApiToken, controllers.api.v1.Users.update)
  .get('/license-key/:key', controllers.api.v1.Users.checkLicenseKey);

export default router;
