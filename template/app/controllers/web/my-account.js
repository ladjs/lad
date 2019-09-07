const humanize = require('humanize-string');
const isSANB = require('is-string-and-not-blank');
const Boom = require('@hapi/boom');

const config = require('../../../config');

async function update(ctx) {
  const { body } = ctx.request;

  if (body.change_password === 'true') {
    ['old_password', 'password', 'confirm_password'].forEach(prop => {
      if (!isSANB(body[prop]))
        throw Boom.badRequest(
          ctx.translate('INVALID_STRING', ctx.request.t(humanize(prop)))
        );
    });

    if (body.password !== body.confirm_password)
      throw Boom.badRequest(ctx.translate('INVALID_PASSWORD_CONFIRM'));

    await ctx.state.user.changePassword(body.old_password, body.password);
    ctx.state.user.reset_token = null;
    ctx.state.user.reset_at = null;
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

  if (ctx.accepts('json')) {
    ctx.body = { reloadPage: true };
  } else {
    ctx.redirect('back');
  }
}

async function resetAPIToken(ctx) {
  ctx.state.user.api_token = null;
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

  if (ctx.accepts('json')) {
    ctx.body = { reloadPage: true };
  } else {
    ctx.redirect('back');
  }
}

module.exports = {
  update,
  resetAPIToken
};
