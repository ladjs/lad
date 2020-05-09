const config = require('../../../../config');

async function recovery(ctx) {
  let redirectTo = `/${ctx.locale}/otp/recovery/verify`;
  if (ctx.session && ctx.session.returnTo) {
    redirectTo = ctx.session.returnTo;
    delete ctx.session.returnTo;
  }

  ctx.state.redirectTo = redirectTo;

  ctx.state.user[config.userFields.pendingRecovery] = true;
  await ctx.state.user.save();

  try {
    ctx.state.user = await ctx.state.user.sendVerificationEmail(ctx);
  } catch (err) {
    // wrap with try/catch to prevent redirect looping
    // (even though the koa redirect loop package will help here)
    if (!err.isBoom) return ctx.throw(err);
    ctx.logger.warn(err);
    if (ctx.accepts('html')) {
      ctx.flash('warning', err.message);
      ctx.redirect('/login');
    } else {
      ctx.body = { message: err.message };
    }

    return;
  }

  redirectTo = `/${ctx.locale}/otp/recovery/verify`;
  if (ctx.accepts('html')) {
    ctx.redirect(redirectTo);
  } else {
    ctx.body = { redirectTo };
  }
}

module.exports = recovery;
