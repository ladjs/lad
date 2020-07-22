const Boom = require('@hapi/boom');
const isSANB = require('is-string-and-not-blank');
const qrcode = require('qrcode');
const { authenticator } = require('otplib');

const config = require('../../../../config');

const options = { width: 500, margin: 0 };

async function setup(ctx) {
  const { body } = ctx.request;

  if (ctx.method === 'DELETE') {
    ctx.state.user[config.passport.fields.otpEnabled] = false;
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
    ctx.redirect(ctx.state.l('/my-account/security'));
    return;
  }

  if (isSANB(body.token)) {
    const isValid = authenticator.verify({
      token: ctx.request.body.token,
      secret: ctx.state.user[config.passport.fields.otpToken]
    });

    if (!isValid) {
      ctx.flash('error', ctx.translate('INVALID_OTP_PASSCODE'));
      ctx.state.otpTokenURI = authenticator.keyuri(
        ctx.state.user.email,
        process.env.WEB_HOST,
        ctx.state.user[config.passport.fields.otpToken]
      );
      ctx.state.qrcode = await qrcode.toDataURL(ctx.state.otpTokenURI, options);
      return ctx.render('otp/enable');
    }

    ctx.state.user[config.passport.fields.otpEnabled] = true;
    await ctx.state.user.save();
    ctx.session.otp = 'totp-setup';
    ctx.flash('custom', {
      title: ctx.request.t('Success'),
      text: ctx.translate('REQUEST_OK'),
      type: 'success',
      toast: true,
      showConfirmButton: false,
      timer: 3000,
      position: 'top'
    });
    ctx.redirect(ctx.state.l('/my-account/security'));
    return;
  }

  if (ctx.state.user[config.userFields.hasSetPassword]) {
    if (!isSANB(body.password))
      throw Boom.badRequest(ctx.translateError('INVALID_PASSWORD'));

    const { user } = await ctx.state.user.authenticate(body.password);
    if (!user) throw Boom.badRequest(ctx.translateError('INVALID_PASSWORD'));
  }

  ctx.state.otpTokenURI = authenticator.keyuri(
    ctx.state.user.email,
    process.env.WEB_HOST,
    ctx.state.user[config.passport.fields.otpToken]
  );
  ctx.state.qrcode = await qrcode.toDataURL(ctx.state.otpTokenURI, options);
  return ctx.render('otp/enable');
}

module.exports = setup;
