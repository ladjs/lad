
import Router from 'koa-router';
import { middleware } from 'koa-ctx-paginate';
import multer from 'koa-multer';
import bytes from 'bytes';

import { web } from '../../app/controllers';
import { policies, renderPage } from '../../helpers';

const router = new Router({
  prefix: '/jobs'
});

const upload = multer({
  limits: {
    fieldNameSize: bytes('100b'),
    fieldSize: bytes('1mb'),
    fileSize: bytes('5mb'),
    fields: 10,
    files: 1
  }
});

router
  .param('slug', web.positions.retrieve)
  .get(
    '/',
    middleware(10, 50),
    web.positions.list,
    renderPage('jobs/list')
  )
  .get('/post-a-job', renderPage('jobs/create'))
  .post(
    '/post-a-job',
    upload.single('company_logo'),
    web.positions.create
  )
  .get('/:slug', renderPage('jobs/retrieve'))
  .get('/:slug/edit', policies.ensureLoggedIn, renderPage('jobs/edit'))
  .put('/:slug', policies.ensureLoggedIn, web.positions.update)
  .del('/:slug', policies.ensureLoggedIn, web.positions.remove)
  .post('/:slug', policies.ensureLoggedIn, web.positions.apply);

export default router;
