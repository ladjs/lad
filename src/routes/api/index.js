
import Router from 'koa-router';

import v1 from './v1';

const router = new Router();
router.use(v1.routes());

export default router;
