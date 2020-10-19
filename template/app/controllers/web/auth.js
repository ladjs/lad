const Boom = require('@hapi/boom');
const _ = require('lodash');
const cryptoRandomString = require('crypto-random-string');
const isSANB = require('is-string-and-not-blank');
const dayjs = require('dayjs');
const qrcode = require('qrcode');
const sanitizeHtml = require('sanitize-html');
const validator = require('validator');
const { authenticator } = require('otplib');
const { boolean } = require('boolean');

const Users = require('../../models/user');
const passport = require('../../../helpers/passport');
const email = require('../../../helpers/email');
const sendVerificationEmail = require('../../../helpers/send-verification-email');
const config = require('../../../config');
const { Inquiries } = require('../../models');

const options = { length: 10, type: 'numeric' };

const sanitize = (string) =>
  sanitizeHtml(string, {
    allowedTags: [],
    allowedAttributes: []
  });

function logout(ctx) {
  if (!ctx.isAuthenticated()) return ctx.redirect(ctx.state.l());
  if (ctx.session.otp && !ctx.session.otp_remember_me) delete ctx.session.otp;
  ctx.logout();
  ctx.flash('custom', {
    title: ctx.request.t('Success'),
    text: ctx.translate('REQUEST_OK'),
    type: 'success',
    toast: true,
    showConfirmButton: false,
    timer: 3000,
    position: 'top'
  });
  ctx.redirect(ctx.state.l());
}

function parseReturnOrRedirectTo(ctx, next) {
  // if the user passed `?return_to` and it is not blank
  // then set it as the returnTo value for when we log in
  if (isSANB(ctx.query.return_to)) {
    ctx.session.returnTo = ctx.query.return_to;
  } else if (isSANB(ctx.query.redirect_to)) {
    // in case people had a typo, we should support redirect_to as well
    ctx.session.returnTo = ctx.query.redirect_to;
  }

  // prevents lad being used as a open redirect
  if (
    ctx.session.returnTo &&
    ctx.session.returnTo.includes('://') &&
    ctx.session.returnTo.indexOf(config.urls.web) !== 0
  ) {
    ctx.logger.warn(
      `Prevented abuse with returnTo hijacking to ${ctx.session.returnTo}`
    );
    ctx.session.returnTo = null;
  }

  return next();
}

async function registerOrLogin(ctx) {
  if (ctx.isAuthenticated()) {
    let redirectTo = ctx.state.l(
      config.passportCallbackOptions.successReturnToOrRedirect
    );

    if (ctx.session && ctx.session.returnTo) {
      redirectTo = ctx.session.returnTo;
      delete ctx.session.returnTo;
    }

    ctx.flash('success', ctx.translate('ALREADY_SIGNED_IN'));

    if (ctx.accepts('html')) ctx.redirect(redirectTo);
    else ctx.body = { redirectTo };
    return;
  }

  ctx.state.verb =
    ctx.pathWithoutLocale === '/register' ? 'sign up' : 'sign in';

  return ctx.render('register-or-login');
}

async function homeOrDashboard(ctx) {
  // If the user is logged in then take them to their dashboard
  if (ctx.isAuthenticated())
    return ctx.redirect(
      ctx.state.l(config.passportCallbackOptions.successReturnToOrRedirect)
    );
  // Manually set page title since we don't define Home route in config/meta
  ctx.state.meta = {
    title: sanitize(
      ctx.request.t(
        `The Best Node.js Framework &#124; <span class="notranslate">${config.appName}</span>`
      )
    ),
    description: sanitize(ctx.request.t(config.pkg.description))
  };

  return ctx.render('home');
}

async function login(ctx, next) {
  if (ctx.isAuthenticated()) {
    let redirectTo = ctx.state.l(
      config.passportCallbackOptions.successReturnToOrRedirect
    );

    if (ctx.session && ctx.session.returnTo) {
      redirectTo = ctx.session.returnTo;
      delete ctx.session.returnTo;
    }

    ctx.flash('success', ctx.translate('ALREADY_SIGNED_IN'));

    if (ctx.accepts('html')) ctx.redirect(redirectTo);
    else ctx.body = { redirectTo };
    return;
  }

  await passport.authenticate('local', async (err, user, info) => {
    if (err) throw err;

    if (!user) {
      if (info) throw info;
      throw ctx.translateError('UNKNOWN_ERROR');
    }

    // redirect user to their last locale they were using
    if (
      user &&
      isSANB(user[config.lastLocaleField]) &&
      user[config.lastLocaleField] !== ctx.locale
    ) {
      ctx.state.locale = user[config.lastLocaleField];
      ctx.request.locale = ctx.state.locale;
      ctx.locale = ctx.request.locale;
    }

    let redirectTo = ctx.state.l(
      config.passportCallbackOptions.successReturnToOrRedirect
    );

    if (ctx.session && ctx.session.returnTo) {
      redirectTo = ctx.session.returnTo;
      delete ctx.session.returnTo;
    }

    let greeting = 'Good morning';
    if (dayjs().format('HH') >= 12 && dayjs().format('HH') <= 17)
      greeting = 'Good afternoon';
    else if (dayjs().format('HH') >= 17) greeting = 'Good evening';

    if (user) {
      await ctx.login(user);

      ctx.flash('custom', {
        title: `${ctx.request.t('Hello')} ${ctx.state.emoji('wave')}`,
        text: user[config.userFields.givenName]
          ? `${greeting} ${user[config.userFields.givenName]}`
          : greeting,
        type: 'success',
        toast: true,
        showConfirmButton: false,
        timer: 3000,
        position: 'top'
      });

      const uri = authenticator.keyuri(
        user.email,
        'lad.sh',
        user[config.passport.fields.otpToken]
      );

      ctx.state.user.qrcode = await qrcode.toDataURL(uri);
      ctx.state.user = await ctx.state.user.save();

      if (user[config.passport.fields.otpEnabled] && !ctx.session.otp)
        redirectTo = ctx.state.l(config.loginOtpRoute);

      if (ctx.accepts('html')) {
        ctx.redirect(redirectTo);
      } else {
        ctx.body = { redirectTo };
      }

      return;
    }

    ctx.flash('custom', {
      title: `${ctx.translate('HELLO')} ${ctx.state.emoji('wave')}`,
      text: ctx.translate('SIGNED_IN'),
      type: 'success',
      toast: true,
      showConfirmButton: false,
      timer: 3000,
      position: 'top'
    });

    if (ctx.accepts('html')) ctx.redirect(redirectTo);
    else ctx.body = { redirectTo };
  })(ctx, next);
}

async function loginOtp(ctx, next) {
  await passport.authenticate('otp', (err, user) => {
    if (err) throw err;
    if (!user)
      throw Boom.unauthorized(ctx.translateError('INVALID_OTP_PASSCODE'));

    ctx.session.otp_remember_me = boolean(ctx.request.body.otp_remember_me);

    ctx.session.otp = 'totp';
    const redirectTo = ctx.state.l('/dashboard');

    if (ctx.accepts('json')) {
      ctx.body = { redirectTo };
    } else {
      ctx.redirect(redirectTo);
    }
  })(ctx, next);
}

async function recoveryKey(ctx) {
  let redirectTo = ctx.state.l(
    config.passportCallbackOptions.successReturnToOrRedirect
  );

  if (ctx.session && ctx.session.returnTo) {
    redirectTo = ctx.session.returnTo;
    delete ctx.session.returnTo;
  }

  ctx.state.redirectTo = redirectTo;

  let recoveryKeys = ctx.state.user[config.userFields.otpRecoveryKeys];

  // ensure recovery matches user list of keys
  if (
    !isSANB(ctx.request.body.recovery_key) ||
    !Array.isArray(recoveryKeys) ||
    recoveryKeys.length === 0 ||
    !recoveryKeys.includes(ctx.request.body.recovery_key)
  )
    return ctx.throw(
      Boom.badRequest(ctx.translateError('INVALID_RECOVERY_KEY'))
    );

  // remove used key from recovery key list
  recoveryKeys = recoveryKeys.filter(
    (key) => key !== ctx.request.body.recovery_key
  );

  const emptyRecoveryKeys = recoveryKeys.length === 0;
  const type = emptyRecoveryKeys ? 'warning' : 'success';
  redirectTo = emptyRecoveryKeys
    ? ctx.state.l('/my-account/security')
    : redirectTo;

  // handle case if the user runs out of keys
  if (emptyRecoveryKeys) {
    recoveryKeys = await Promise.all(
      new Array(10).fill().map(() => cryptoRandomString.async(options))
    );
  }

  ctx.state.user[config.userFields.otpRecoveryKeys] = recoveryKeys;
  ctx.state.user = await ctx.state.user.save();

  ctx.session.otp = 'totp-recovery';

  const message = ctx.translate(
    type === 'warning' ? 'OTP_RECOVERY_RESET' : 'OTP_RECOVERY_SUCCESS'
  );
  if (ctx.accepts('html')) {
    ctx.flash(type, message);
    ctx.redirect(redirectTo);
  } else {
    ctx.body = {
      ...(emptyRecoveryKeys
        ? {
            swal: {
              title: ctx.translate('EMPTY_RECOVERY_KEYS'),
              type,
              text: message
            }
          }
        : { message }),
      redirectTo
    };
  }
}

async function register(ctx) {
  const { body } = ctx.request;

  if (!_.isString(body.email) || !validator.isEmail(body.email))
    throw Boom.badRequest(ctx.translateError('INVALID_EMAIL'));

  if (!isSANB(body.password))
    throw Boom.badRequest(ctx.translateError('INVALID_PASSWORD'));

  // register the user
  const count = await Users.countDocuments({ group: 'admin' });
  const query = {
    email: body.email,
    group: count === 0 ? 'admin' : 'user',
    locale: ctx.locale
  };
  query[config.userFields.hasVerifiedEmail] = false;
  query[config.userFields.hasSetPassword] = true;
  query[config.lastLocaleField] = ctx.locale;
  const user = await Users.register(query, body.password);

  await ctx.login(user);

  let redirectTo = ctx.state.l(
    config.passportCallbackOptions.successReturnToOrRedirect
  );

  if (ctx.session && ctx.session.returnTo) {
    redirectTo = ctx.session.returnTo;
    delete ctx.session.returnTo;
  }

  ctx.flash('custom', {
    title: `${ctx.request.t('Thank you')} ${ctx.state.emoji('pray')}`,
    text: ctx.translate('REGISTERED'),
    type: 'success',
    toast: true,
    showConfirmButton: false,
    timer: 3000,
    position: 'top'
  });

  if (ctx.accepts('html')) ctx.redirect(redirectTo);
  else ctx.body = { redirectTo };
}

async function forgotPassword(ctx) {
  const { body } = ctx.request;

  if (!_.isString(body.email) || !validator.isEmail(body.email))
    throw Boom.badRequest(ctx.translateError('INVALID_EMAIL'));

  // lookup the user
  let user = await Users.findOne({ email: body.email });

  // to prevent people from being able to find out valid email accounts
  // we always say "a password reset request has been sent to your email"
  // and if the email didn't exist in our system then we simply don't send it
  if (!user) {
    if (ctx.accepts('html')) {
      ctx.flash('success', ctx.translate('PASSWORD_RESET_SENT'));
      ctx.redirect('back');
    } else {
      ctx.body = {
        message: ctx.translate('PASSWORD_RESET_SENT')
      };
    }

    return;
  }

  // if we've already sent a reset password request in the past half hour
  if (
    user[config.userFields.resetTokenExpiresAt] &&
    user[config.userFields.resetToken] &&
    dayjs(user[config.userFields.resetTokenExpiresAt]).isAfter(
      dayjs().subtract(30, 'minutes')
    )
  )
    throw Boom.badRequest(
      ctx.translateError(
        'PASSWORD_RESET_LIMIT',
        dayjs(user[config.userFields.resetTokenExpiresAt]).fromNow()
      )
    );

  // set the reset token and expiry
  user[config.userFields.resetTokenExpiresAt] = dayjs()
    .add(30, 'minutes')
    .toDate();
  user[config.userFields.resetToken] = await cryptoRandomString.async({
    length: 32
  });

  user = await user.save();

  // queue password reset email
  try {
    await email({
      template: 'reset-password',
      message: {
        to: user[config.userFields.fullEmail]
      },
      locals: {
        user: _.pick(user, [
          config.userFields.displayName,
          config.userFields.resetTokenExpiresAt
        ]),
        link: `${config.urls.web}/reset-password/${
          user[config.userFields.resetToken]
        }`
      }
    });

    if (ctx.accepts('html')) {
      ctx.flash('success', ctx.translate('PASSWORD_RESET_SENT'));
      ctx.redirect('back');
    } else {
      ctx.body = {
        message: ctx.translate('PASSWORD_RESET_SENT')
      };
    }
  } catch (err) {
    ctx.logger.error(err);
    // reset if there was an error
    try {
      user[config.userFields.resetToken] = null;
      user[config.userFields.resetTokenExpiresAt] = null;
      user = await user.save();
    } catch (err) {
      ctx.logger.error(err);
    }

    throw Boom.badRequest(ctx.translateError('EMAIL_FAILED_TO_SEND'));
  }
}

async function resetPassword(ctx) {
  const { body } = ctx.request;

  if (!_.isString(body.email) || !validator.isEmail(body.email))
    throw Boom.badRequest(ctx.translateError('INVALID_EMAIL'));

  if (!isSANB(body.password))
    throw Boom.badRequest(ctx.translateError('INVALID_PASSWORD'));

  if (!isSANB(ctx.params.token))
    throw Boom.badRequest(ctx.translateError('INVALID_RESET_TOKEN'));

  // lookup the user that has this token and if it matches the email passed
  const query = { email: body.email };
  query[config.userFields.resetToken] = ctx.params.token;
  // ensure that the reset token expires at value is in the future (hasn't expired)
  query[config.userFields.resetTokenExpiresAt] = { $gte: new Date() };
  let user = await Users.findOne(query);

  if (!user)
    throw Boom.badRequest(ctx.translateError('INVALID_RESET_PASSWORD'));

  user[config.userFields.resetToken] = null;
  user[config.userFields.resetTokenExpiresAt] = null;

  await user.setPassword(body.password);
  user = await user.save();
  await ctx.login(user);
  const message = ctx.translate('RESET_PASSWORD');
  const redirectTo = ctx.state.l();
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

async function changeEmail(ctx) {
  const { body } = ctx.request;

  if (!isSANB(body.password))
    throw Boom.badRequest(ctx.translateError('INVALID_PASSWORD'));

  if (!isSANB(ctx.params.token))
    throw Boom.badRequest(ctx.translateError('INVALID_RESET_TOKEN'));

  // lookup the user that has this token and if it matches the email passed
  const query = { email: body.email };
  query[config.userFields.changeEmailToken] = ctx.params.token;
  // ensure that the reset token expires at value is in the future (hasn't expired)
  query[config.userFields.changeEmailTokenExpiresAt] = { $gte: new Date() };
  const user = await Users.findOne(query);

  try {
    if (!user) throw Boom.badRequest(ctx.translateError('INVALID_SET_EMAIL'));

    const auth = await user.authenticate(body.password);
    if (!auth.user)
      throw Boom.badRequest(ctx.translateError('INVALID_PASSWORD'));

    const newEmail = user[config.userFields.changeEmailNewAddress];
    user[config.passportLocalMongoose.usernameField] = newEmail;
    await user.save();

    // reset change email info
    user[config.userFields.changeEmailToken] = null;
    user[config.userFields.changeEmailTokenExpiresAt] = null;
    user[config.userFields.changeEmailNewAddress] = null;
    await user.save();
  } catch (err) {
    ctx.throw(err);
  }

  const message = ctx.translate('CHANGE_EMAIL');
  const redirectTo = ctx.state.l();
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

async function catchError(ctx, next) {
  try {
    await next();
  } catch (err) {
    ctx.logger.error(err);
    if (ctx.params.provider === 'google' && err.message === 'Consent required')
      return ctx.redirect('/auth/google/consent');
    ctx.flash('error', err.message);
    ctx.redirect('/login');
  }
}

// eslint-disable-next-line complexity
async function verify(ctx) {
  let redirectTo = ctx.state.l(
    config.passportCallbackOptions.successReturnToOrRedirect
  );

  if (ctx.session && ctx.session.returnTo) {
    redirectTo = ctx.session.returnTo;
    delete ctx.session.returnTo;
  }

  ctx.state.redirectTo = redirectTo;

  if (
    ctx.state.user[config.userFields.hasVerifiedEmail] &&
    !ctx.state.user[config.userFields.pendingRecovery]
  ) {
    const message = ctx.translate('EMAIL_ALREADY_VERIFIED');
    if (ctx.accepts('html')) {
      ctx.flash('success', message);
      ctx.redirect(redirectTo);
    } else {
      ctx.body = { message, redirectTo };
    }

    return;
  }

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
      ctx.state.user = await sendVerificationEmail(ctx);
    } catch (err) {
      // wrap with try/catch to prevent redirect looping
      // (even though the koa redirect loop package will help here)
      if (!err.isBoom) return ctx.throw(err);
      ctx.logger.error(err);
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
      Boom.badRequest(ctx.translateError('INVALID_VERIFICATION_PIN'))
    );

  // set has verified to true
  ctx.state.user[config.userFields.hasVerifiedEmail] = true;
  ctx.state.user = await ctx.state.user.save();

  const pendingRecovery = ctx.state.user[config.userFields.pendingRecovery];
  if (pendingRecovery) {
    const body = {};
    body.email = ctx.state.user.email;
    body.message = ctx.translate('SUPPORT_REQUEST_MESSAGE');
    body.is_email_only = true;
    const inquiry = await Inquiries.create({
      ...body,
      ip: ctx.ip
    });

    ctx.logger.debug('created inquiry', inquiry);

    try {
      await email({
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
    } catch (err) {
      ctx.logger.error(err);
      throw Boom.badRequest(ctx.translateError('EMAIL_FAILED_TO_SEND'));
    }
  }

  const message = pendingRecovery
    ? ctx.translate('PENDING_RECOVERY_VERIFICATION_SUCCESS')
    : ctx.translate('EMAIL_VERIFICATION_SUCCESS');

  redirectTo = pendingRecovery ? '/logout' : redirectTo;
  if (ctx.accepts('html')) {
    ctx.flash('success', message);
    ctx.redirect(redirectTo);
  } else {
    ctx.body = { message, redirectTo };
  }
}

module.exports = {
  logout,
  registerOrLogin,
  homeOrDashboard,
  login,
  loginOtp,
  register,
  forgotPassword,
  resetPassword,
  recoveryKey,
  changeEmail,
  catchError,
  verify,
  parseReturnOrRedirectTo
};
