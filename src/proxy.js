
// this redirects any incoming connections
// on port 80 to port 443 (http -> https)

import qs from 'qs';
import _ from 'lodash';
import Koa from 'koa';

const app = new Koa();

app.use(ctx => {
  // 301 = permanent redirect for SEO
  ctx.status = 301;
  ctx.redirect(`https://${ctx.hostname}${ctx.path}${_.isEmpty(ctx.query) ? '' : `?${qs.stringify(ctx.query)}`}`);
});

app.listen(80);
