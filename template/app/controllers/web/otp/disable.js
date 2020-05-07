const Boom = require('@hapi/boom');
const isSANB = require('is-string-and-not-blank');

const config = require('../../../../config');

async function disable(ctx) {
  const { body } = ctx.request;

  const redirectTo = `/${ctx.locale}/my-account/security`;

  if (!isSANB(body.password))
    throw Boom.badRequest(ctx.translate('INVALID_PASSWORD'));

  const { user } = await ctx.state.user.authenticate(body.password);
  if (!user) throw Boom.badRequest(ctx.translate('INVALID_PASSWORD'));

  ctx.state.user[config.passport.fields.otpEnabled] = false;
  ctx.state.user[config.passport.fields.otpToken] = null;
  ctx.state.user[config.userFields.otpRecoveryKeys] = null;
  await ctx.state.user.save();

  ctx.flash('custom', {
    title: ctx.request.t('Success'),
    text: ctx.translate('REQUEST_OK'),
    type: 'success',
    toast: true,
    showConfirmButton: false,
    timer: 3000,
    position: 'top'
  });

  if (ctx.accepts('html')) ctx.redirect(redirectTo);
  else ctx.body = { redirectTo };
}

module.exports = disable;
