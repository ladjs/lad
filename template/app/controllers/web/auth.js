const Boom = require('@hapi/boom');
const _ = require('lodash');
const cryptoRandomString = require('crypto-random-string');
const isSANB = require('is-string-and-not-blank');
const moment = require('moment');
const sanitizeHtml = require('sanitize-html');
const validator = require('validator');
const { boolean } = require('boolean');

const bull = require('../../../bull');
const Users = require('../../models/user');
const passport = require('../../../helpers/passport');
const config = require('../../../config');

const sanitize = str =>
  sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: []
  });

function logout(ctx) {
  if (!ctx.isAuthenticated()) return ctx.redirect(`/${ctx.locale}`);
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
  ctx.redirect(`/${ctx.locale}`);
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
  ctx.state.verb =
    ctx.pathWithoutLocale === '/register' ? 'sign up' : 'sign in';

  await ctx.render('register-or-login');
}

async function homeOrDashboard(ctx) {
  // If the user is logged in then take them to their dashboard
  if (ctx.isAuthenticated())
    return ctx.redirect(
      `/${ctx.locale}${config.passportCallbackOptions.successReturnToOrRedirect}`
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
  await ctx.render('home');
}

async function login(ctx, next) {
  await passport.authenticate('local', async (err, user, info) => {
    if (err) throw err;

    if (!user) {
      if (info) throw info;
      throw new Error(ctx.translate('UNKNOWN_ERROR'));
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

    let redirectTo = `/${ctx.locale}${config.passportCallbackOptions.successReturnToOrRedirect}`;

    if (ctx.session && ctx.session.returnTo) {
      redirectTo = ctx.session.returnTo;
      delete ctx.session.returnTo;
    }

    try {
      await ctx.login(user);
    } catch (err_) {
      throw err_;
    }

    let greeting = 'Good morning';
    if (moment().format('HH') >= 12 && moment().format('HH') <= 17)
      greeting = 'Good afternoon';
    else if (moment().format('HH') >= 17) greeting = 'Good evening';

    ctx.flash('custom', {
      title: `${ctx.request.t('Hello')} ${ctx.state.emoji('wave')}`,
      text: user[config.passport.fields.givenName]
        ? `${greeting} ${user[config.passport.fields.givenName]}`
        : greeting,
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

async function register(ctx) {
  const { body } = ctx.request;

  if (!_.isString(body.email) || !validator.isEmail(body.email))
    throw Boom.badRequest(ctx.translate('INVALID_EMAIL'));

  if (!isSANB(body.password))
    throw Boom.badRequest(ctx.translate('INVALID_PASSWORD'));

  // register the user
  const count = await Users.countDocuments({ group: 'admin' });
  const query = { email: body.email, group: count === 0 ? 'admin' : 'user' };
  query[config.userFields.hasVerifiedEmail] = false;
  query[config.userFields.hasSetPassword] = true;
  const user = await Users.register(query, body.password);

  await ctx.login(user);

  let redirectTo = `/${ctx.locale}${config.passportCallbackOptions.successReturnToOrRedirect}`;

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
    throw Boom.badRequest(ctx.translate('INVALID_EMAIL'));

  // lookup the user
  const user = await Users.findOne({ email: body.email });

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
    moment(user[config.userFields.resetTokenExpiresAt]).isAfter(
      moment().subtract(30, 'minutes')
    )
  )
    throw Boom.badRequest(
      ctx.translate(
        'PASSWORD_RESET_LIMIT',
        moment(user[config.userFields.resetTokenExpiresAt]).fromNow()
      )
    );

  // set the reset token and expiry
  user[config.userFields.resetTokenExpiresAt] = moment()
    .add(30, 'minutes')
    .toDate();
  user[config.userFields.resetToken] = cryptoRandomString({ length: 32 });

  await user.save();

  if (ctx.accepts('html')) {
    ctx.flash('success', ctx.translate('PASSWORD_RESET_SENT'));
    ctx.redirect('back');
  } else {
    ctx.body = {
      message: ctx.translate('PASSWORD_RESET_SENT')
    };
  }

  // queue password reset email
  try {
    const job = await bull.add('email', {
      template: 'reset-password',
      message: {
        to: user[config.userFields.fullEmail]
      },
      locals: {
        user: _.pick(user, [
          config.passport.fields.displayName,
          config.userFields.resetTokenExpiresAt
        ]),
        link: `${config.urls.web}/reset-password/${
          user[config.userFields.resetToken]
        }`
      }
    });
    ctx.logger.info('added job', bull.getMeta({ job }));
  } catch (err) {
    ctx.logger.error(err);
  }
}

async function resetPassword(ctx) {
  const { body } = ctx.request;

  if (!_.isString(body.email) || !validator.isEmail(body.email))
    throw Boom.badRequest(ctx.translate('INVALID_EMAIL'));

  if (!isSANB(body.password))
    throw Boom.badRequest(ctx.translate('INVALID_PASSWORD'));

  if (!isSANB(ctx.params.token))
    throw Boom.badRequest(ctx.translate('INVALID_RESET_TOKEN'));

  // lookup the user that has this token and if it matches the email passed
  const query = { email: body.email };
  query[config.userFields.resetToken] = ctx.params.token;
  // ensure that the reset token expires at value is in the future (hasn't expired)
  query[config.userFields.resetTokenExpiresAt] = { $gte: new Date() };
  const user = await Users.findOne(query);

  if (!user) throw Boom.badRequest(ctx.translate('INVALID_RESET_PASSWORD'));

  user[config.userFields.resetToken] = null;
  user[config.userFields.resetTokenExpiresAt] = null;

  await user.setPassword(body.password);
  await user.save();
  await ctx.login(user);
  const message = ctx.translate('RESET_PASSWORD');
  const redirectTo = `/${ctx.locale}`;
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
  let redirectTo = `/${ctx.locale}${config.passportCallbackOptions.successReturnToOrRedirect}`;

  if (ctx.session && ctx.session.returnTo) {
    redirectTo = ctx.session.returnTo;
    delete ctx.session.returnTo;
  }

  ctx.state.redirectTo = redirectTo;

  if (ctx.state.user[config.userFields.hasVerifiedEmail]) {
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

  // set has verified to true
  ctx.state.user[config.userFields.hasVerifiedEmail] = true;
  await ctx.state.user.save();

  // send the user a success message
  const message = ctx.translate('EMAIL_VERIFICATION_SUCCESS');

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
  register,
  forgotPassword,
  resetPassword,
  catchError,
  verify,
  parseReturnOrRedirectTo
};
