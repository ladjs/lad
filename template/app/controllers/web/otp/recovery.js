const config = require('../../../../config');
const sendVerificationEmail = require('../../../../helpers/send-verification-email');

async function recovery(ctx) {
  const redirectTo = ctx.state.l(config.verifyRoute);

  ctx.state.redirectTo = redirectTo;

  ctx.state.user[config.userFields.pendingRecovery] = true;
  await ctx.state.user.save();

  try {
    ctx.state.user = await sendVerificationEmail(ctx);
  } catch (err) {
    // wrap with try/catch to prevent redirect looping
    // (even though the koa redirect loop package will help here)
    if (!err.isBoom) return ctx.throw(err);
    ctx.logger.warn(err);
    if (ctx.accepts('html')) {
      ctx.flash('warning', err.message);
      ctx.redirect(ctx.state.l(config.loginRoute));
    } else {
      ctx.body = { message: err.message };
    }

    return;
  }

  if (ctx.accepts('html')) {
    ctx.redirect(redirectTo);
  } else {
    ctx.body = { redirectTo };
  }
}

module.exports = recovery;
