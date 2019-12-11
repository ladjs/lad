const humanize = require('humanize-string');
const isSANB = require('is-string-and-not-blank');
const Boom = require('@hapi/boom');

const config = require('../../../config');

async function update(ctx) {
  const { body } = ctx.request;
  const hasSetPassword = ctx.state.user[config.userFields.hasSetPassword];

  const requiredFields = ['password', 'confirm_password'];

  if (hasSetPassword) requiredFields.push('old_password');

  if (body.change_password === 'true') {
    requiredFields.forEach(prop => {
      if (!isSANB(body[prop]))
        throw Boom.badRequest(
          ctx.translate('INVALID_STRING', ctx.request.t(humanize(prop)))
        );
    });

    if (body.password !== body.confirm_password)
      throw Boom.badRequest(ctx.translate('INVALID_PASSWORD_CONFIRM'));

    if (hasSetPassword)
      await ctx.state.user.changePassword(body.old_password, body.password);
    else {
      await ctx.state.user.setPassword(body.password);
      ctx.state.user[config.userFields.hasSetPassword] = true;
    }

    ctx.state.user[config.userFields.resetToken] = null;
    ctx.state.user[config.userFields.resetTokenExpiresAt] = null;
  } else {
    ctx.state.user[config.passport.fields.givenName] =
      body[config.passport.fields.givenName];
    ctx.state.user[config.passport.fields.familyName] =
      body[config.passport.fields.familyName];
    ctx.state.user.email = body.email;
  }

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

  if (ctx.accepts('html')) ctx.redirect('back');
  else ctx.body = { reloadPage: true };
}

async function resetAPIToken(ctx) {
  ctx.state.user[config.userFields.apiToken] = null;
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

  if (ctx.accepts('html')) ctx.redirect('back');
  else ctx.body = { reloadPage: true };
}

module.exports = {
  update,
  resetAPIToken
};
