
import Router from 'koa-router';

import { policies, renderPage } from '../../helpers';

const router = new Router({
  prefix: '/admin'
});

router.use(policies.ensureAdmin);
router.get('/', renderPage('admin'));

export default router;
