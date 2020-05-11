const Boom = require('@hapi/boom');
const isSANB = require('is-string-and-not-blank');
const { boolean } = require('boolean');

const { Inquiries } = require('../../../models');
const bull = require('../../../../bull');
const config = require('../../../../config');

// eslint-disable-next-line complexity
async function verify(ctx) {
  let redirectTo = `/${ctx.locale}/login`;

  if (ctx.session && ctx.session.returnTo) {
    redirectTo = ctx.session.returnTo;
    delete ctx.session.returnTo;
  }

  ctx.state.redirectTo = redirectTo;

  // allow user to click a button to request a new email after 60 seconds
  // after their last attempt to get a verification email
  const resend = ctx.method === 'GET' && boolean(ctx.query.resend);

  if (
    !ctx.state.user[config.userFields.verificationPin] ||
    !ctx.state.user[config.userFields.verificationPinExpiresAt] ||
    ctx.state.user[config.userFields.verificationPinHasExpired] ||
    resend
  ) {
    try {
      ctx.state.user = await ctx.state.user.sendVerificationEmail(ctx);
    } catch (err) {
      // wrap with try/catch to prevent redirect looping
      // (even though the koa redirect loop package will help here)
      if (!err.isBoom) return ctx.throw(err);
      ctx.logger.warn(err);
      if (ctx.accepts('html')) {
        ctx.flash('warning', err.message);
        ctx.redirect(redirectTo);
      } else {
        ctx.body = { message: err.message };
      }

      return;
    }

    const message = ctx.translate(
      ctx.state.user[config.userFields.verificationPinHasExpired]
        ? 'EMAIL_VERIFICATION_EXPIRED'
        : 'EMAIL_VERIFICATION_SENT'
    );

    if (!ctx.accepts('html')) {
      ctx.body = { message };
      return;
    }

    ctx.flash('success', message);
  }

  // if it's a GET request then render the page
  if (ctx.method === 'GET' && !isSANB(ctx.query.pin))
    return ctx.render('verify');

  // if it's a POST request then ensure the user entered the 6 digit pin
  // otherwise if it's a GET request then use the ctx.query.pin
  let pin = '';
  if (ctx.method === 'GET') pin = ctx.query.pin;
  else pin = isSANB(ctx.request.body.pin) ? ctx.request.body.pin : '';

  // convert to digits only
  pin = pin.replace(/\D/g, '');

  // ensure pin matches up
  if (
    !ctx.state.user[config.userFields.verificationPin] ||
    pin !== ctx.state.user[config.userFields.verificationPin]
  )
    return ctx.throw(
      Boom.badRequest(ctx.translate('INVALID_VERIFICATION_PIN'))
    );

  try {
    const body = {};
    body.email = ctx.state.user.email;
    body.message = ctx.translate('SUPPORT_REQUEST_MESSAGE');
    body.is_email_only = true;
    const inquiry = await Inquiries.create({
      ...body,
      ip: ctx.ip
    });

    ctx.logger.debug('created inquiry', inquiry);

    const job = await bull.add('email', {
      template: 'recovery',
      message: {
        to: ctx.state.user.email,
        cc: config.email.message.from
      },
      locals: {
        locale: ctx.locale,
        inquiry
      }
    });

    ctx.logger.info('added job', bull.getMeta({ job }));

    const message = ctx.translate('PENDING_RECOVERY_VERIFICATION_SUCCESS');
    if (ctx.accepts('html')) {
      ctx.flash('success', message);
      ctx.redirect(redirectTo);
    } else {
      ctx.body = { message, redirectTo };
    }
  } catch (err) {
    ctx.logger.error(err);
    throw Boom.badRequest(ctx.translate('SUPPORT_REQUEST_ERROR'));
  }

  ctx.logout();
}

module.exports = verify;
