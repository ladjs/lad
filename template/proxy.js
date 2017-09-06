// TODO: rewrite this to use pure http server
// this redirects any incoming connections
// on port 80 to port 443 (http -> https)

const qs = require('qs');
const _ = require('lodash');
const Koa = require('koa');

const app = new Koa();

app.use(ctx => {
  // 301 = permanent redirect for SEO
  ctx.status = 301;
  ctx.redirect(
    `https://${ctx.hostname}${ctx.path}${_.isEmpty(ctx.query)
      ? ''
      : `?${qs.stringify(ctx.query)}`}`
  );
});

if (!module.parent) app.listen(80);

module.exports = app;
