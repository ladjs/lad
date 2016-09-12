
export default async function _404Handler(ctx, next) {
  try {
    await next();
    if (ctx.status === 404)
      ctx.throw(404);
  } catch (err) {
    ctx.throw(err);
    ctx.app.emit('error', err, ctx);
  }
}
