const Boom = require('@hapi/boom');
const _ = require('lodash');
const cryptoRandomString = require('crypto-random-string');
const humanize = require('humanize-string');
const isSANB = require('is-string-and-not-blank');
const dayjs = require('dayjs');
const { isEmail } = require('validator');

dayjs.extend(require('dayjs/plugin/duration'));
dayjs.extend(require('dayjs/plugin/relativeTime'));

const config = require('../../../config');
const emailHelper = require('../../../helpers/email');
const { Users } = require('../../models');

async function update(ctx) {
  const { body } = ctx.request;
  const hasSetPassword = ctx.state.user[config.userFields.hasSetPassword];

  const requiredFields = ['password', 'confirm_password'];

  if (hasSetPassword) requiredFields.push('old_password');

  if (body.change_password === 'true') {
    requiredFields.forEach((prop) => {
      if (!isSANB(body[prop]))
        throw Boom.badRequest(
          ctx.translateError('INVALID_STRING', ctx.request.t(humanize(prop)))
        );
    });

    if (body.password !== body.confirm_password)
      throw Boom.badRequest(ctx.translateError('INVALID_PASSWORD_CONFIRM'));

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
  }

  // check if we need to update the email and send an email confirmation
  const hasNewEmail =
    isSANB(body.email) &&
    ctx.state.user[config.passportLocalMongoose.usernameField] !== body.email;

  // confirm user supplied email is different than current email
  if (hasNewEmail) {
    // validate it (so it doesn't have to use mongoose for this)
    if (!isEmail(body.email))
      return ctx.throw(Boom.badRequest(ctx.translateError('INVALID_EMAIL')));

    // if we've already sent a change email request in the past half hour
    if (
      ctx.state.user[config.userFields.changeEmailTokenExpiresAt] &&
      ctx.state.user[config.userFields.changeEmailToken] &&
      dayjs(
        ctx.state.user[config.userFields.changeEmailTokenExpiresAt]
      ).isAfter(
        dayjs().subtract(config.changeEmailTokenTimeoutMs, 'milliseconds')
      )
    )
      throw Boom.badRequest(
        ctx.translateError(
          'EMAIL_CHANGE_LIMIT',
          dayjs.duration(config.changeEmailLimitMs, 'milliseconds').minutes(),
          dayjs(
            ctx.state.user[config.userFields.changeEmailTokenExpiresAt]
          ).fromNow()
        )
      );

    // short-circuit if email already exists
    const query = { email: body.email };
    const user = await Users.findOne(query);
    if (user)
      throw Boom.badRequest(
        ctx.translateError('EMAIL_CHANGE_ALREADY_EXISTS', body.email)
      );

    // set the reset token and expiry
    ctx.state.user[config.userFields.changeEmailTokenExpiresAt] = dayjs()
      .add(config.changeEmailTokenTimeoutMs, 'milliseconds')
      .toDate();
    ctx.state.user[
      config.userFields.changeEmailToken
    ] = await cryptoRandomString.async({
      length: 32
    });
    ctx.state.user[config.userFields.changeEmailNewAddress] = body.email;
  }

  // save the user
  ctx.state.user = await ctx.state.user.save();

  // send the email
  if (hasNewEmail) {
    try {
      await emailHelper({
        template: 'change-email',
        message: {
          to: body.email
        },
        locals: {
          user: _.pick(ctx.state.user, [
            config.userFields.changeEmailTokenExpiresAt,
            config.userFields.changeEmailNewAddress,
            config.passportLocalMongoose.usernameField
          ]),
          link: `${config.urls.web}/my-account/change-email/${
            ctx.state.user[config.userFields.changeEmailToken]
          }`
        }
      });
    } catch (err) {
      ctx.logger.error(err);
      // reset if there was an error
      try {
        ctx.state.user[config.userFields.changeEmailToken] = null;
        ctx.state.user[config.userFields.changeEmailTokenExpiresAt] = null;
        ctx.state.user[config.userFields.changeEmailNewAddress] = null;
        ctx.state.user = await ctx.state.user.save();
      } catch (err) {
        ctx.logger.error(err);
      }

      throw Boom.badRequest(ctx.translateError('EMAIL_FAILED_TO_SEND'));
    }
  }

  if (!ctx.api)
    ctx.flash('custom', {
      title: ctx.request.t('Success'),
      text: ctx.translate(hasNewEmail ? 'EMAIL_CHANGE_SENT' : 'REQUEST_OK'),
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
  ctx.state.user = await ctx.state.user.save();

  if (!ctx.api)
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

async function recoveryKeys(ctx) {
  const otpRecoveryKeys = ctx.state.user[config.userFields.otpRecoveryKeys];

  ctx.attachment('recovery-keys.txt');
  ctx.body = otpRecoveryKeys.toString().replace(/,/g, '\n').replace(/"/g, '');
}

module.exports = {
  update,
  resetAPIToken,
  recoveryKeys
};
