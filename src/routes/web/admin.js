
import Router from 'koa-router';

import { Policies, renderPage } from '../../helpers';

const router = new Router({
  prefix: '/admin'
});

router.use(Policies.ensureAdmin);
router.get('/', renderPage('admin'));

export default router;
