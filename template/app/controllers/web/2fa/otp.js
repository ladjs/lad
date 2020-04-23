const cryptoRandomString = require('crypto-random-string');
const isSANB = require('is-string-and-not-blank');
const qrcode = require('qrcode');
const Boom = require('@hapi/boom');
const { authenticator } = require('otplib');
const config = require('../../../../config');

async function keys(ctx) {
  const { body } = ctx.request;

  if (!isSANB(body.password))
    throw Boom.badRequest(ctx.translate('INVALID_PASSWORD'));

  const { user } = await ctx.state.user.authenticate(body.password);
  if (!user) throw Boom.badRequest(ctx.translate('INVALID_PASSWORD'));

  const redirectTo = `/${ctx.locale}/2fa/otp/verify`;
  const message = ctx.translate('PASSWORD_CONFIRM_SUCCESS');
  if (ctx.accepts('html')) {
    ctx.flash('success', message);
    ctx.redirect(redirectTo);
  } else {
    ctx.body = {
      message,
      redirectTo
    };
  }
}

async function renderKeys(ctx) {
  ctx.state.user[
    config.passport.fields.twoFactorToken
  ] = authenticator.generateSecret();

  // generate 2fa recovery keys list used for fallback
  const recoveryKeys = new Array(16)
    .fill()
    .map(() => cryptoRandomString({ length: 10, characters: '1234567890' }));

  ctx.state.user[config.userFields.twoFactorRecoveryKeys] = recoveryKeys;
  ctx.state.user = await ctx.state.user.save();

  await ctx.render('2fa/otp/keys');
}

async function renderVerify(ctx) {
  ctx.state.twoFactorTokenURI = authenticator.keyuri(
    ctx.state.user.email,
    process.env.WEB_HOST,
    ctx.state.user[config.passport.fields.twoFactorToken]
  );
  ctx.state.qrcode = await qrcode.toDataURL(ctx.state.twoFactorTokenURI);

  await ctx.render('2fa/otp/verify');
}

async function disable(ctx) {
  const { body } = ctx.request;

  const redirectTo = `/${ctx.locale}/my-account/security`;

  if (!isSANB(body.password))
    throw Boom.badRequest(ctx.translate('INVALID_PASSWORD'));

  const { user } = await ctx.state.user.authenticate(body.password);
  if (!user) throw Boom.badRequest(ctx.translate('INVALID_PASSWORD'));

  ctx.state.user[config.passport.fields.twoFactorEnabled] = false;
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

async function verify(ctx) {
  const redirectTo = `/${ctx.locale}/my-account/security`;
  if (ctx.method === 'DELETE') {
    ctx.state.user[config.passport.fields.twoFactorEnabled] = false;
  } else if (
    ctx.method === 'POST' &&
    ctx.state.user[config.passport.fields.twoFactorToken]
  ) {
    const isValid = authenticator.verify({
      token: ctx.request.body.token,
      secret: ctx.state.user[config.passport.fields.twoFactorToken]
    });

    if (!isValid)
      return ctx.throw(Boom.badRequest(ctx.translate('INVALID_OTP_PASSCODE')));

    ctx.state.user[config.passport.fields.twoFactorEnabled] = true;
  } else {
    return ctx.throw(Boom.badRequest('Invalid method'));
  }

  await ctx.state.user.save();

  ctx.session.otp = 'otp-setup';

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

module.exports = {
  disable,
  keys,
  renderKeys,
  renderVerify,
  verify
};
