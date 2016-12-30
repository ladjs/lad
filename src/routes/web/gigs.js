
import Router from 'koa-router';
import { middleware } from 'koa-ctx-paginate';
import multer from 'koa-multer';
import bytes from 'bytes';

import { web } from '../../app/controllers';
import { policies, renderPage } from '../../helpers';

const router = new Router({
  prefix: '/gigs'
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
  .param('slug', web.gigs.retrieve)
  .get(
    '/',
    middleware(10, 50),
    web.gigs.list,
    renderPage('gigs/list')
  )
  .get('/create', renderPage('gigs/create'))
  .post(
    '/create',
    upload.single('company_logo'),
    web.gigs.create
  )
  .get('/:slug', renderPage('gigs/retrieve'))
  .get('/:slug/edit', policies.ensureLoggedIn, renderPage('gigs/edit'))
  .put('/:slug', policies.ensureLoggedIn, web.gigs.update)
  .del('/:slug', policies.ensureLoggedIn, web.gigs.remove)
  .post('/:slug', policies.ensureLoggedIn, web.gigs.apply);

export default router;
