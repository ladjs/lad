const moment = require('moment');
const isSANB = require('is-string-and-not-blank');
const randomstring = require('randomstring-extended');
const Boom = require('@hapi/boom');
const _ = require('lodash');
const validator = require('validator');
const { select } = require('mongoose-json-select');
const sanitizeHtml = require('sanitize-html');

const { Users, Jobs } = require('../../models');
const { passport } = require('../../../helpers');
const config = require('../../../config');

const sanitize = str =>
  sanitizeHtml(str, {
    allowedTags: [],
    allowedAttributes: []
  });

function logout(ctx) {
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

async function registerOrLogin(ctx) {
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
    ctx.session.returnTo.indexOf('://') !== -1 &&
    ctx.session.returnTo.indexOf(config.urls.web) !== 0
  ) {
    ctx.logger.warn(
      `Prevented abuse with returnTo hijacking to ${ctx.session.returnTo}`
    );
    ctx.session.returnTo = null;
  }

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
        `Home &#124; <span class="notranslate">${config.appName}</span>`
      )
    ),
    description: sanitize(ctx.request.t(config.pkg.description))
  };
  await ctx.render('home');
}

async function login(ctx, next) {
  await passport.authenticate('local', async (err, user, info) => {
    if (err) throw err;

    // redirect user to their last locale they were using
    if (
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

    if (user) {
      try {
        await ctx.login(user);
      } catch (err2) {
        throw err2;
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

      if (ctx.accepts('json')) {
        ctx.body = { redirectTo };
      } else {
        ctx.redirect(redirectTo);
      }

      return;
    }

    if (info) throw info;

    throw new Error(ctx.translate('UNKNOWN_ERROR'));
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
  const user = await Users.register(
    { email: body.email, group: count === 0 ? 'admin' : 'user' },
    body.password
  );

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

  if (ctx.accepts('json')) {
    ctx.body = { redirectTo };
  } else {
    ctx.redirect(redirectTo);
  }

  // add welcome email job
  try {
    const job = await Jobs.create({
      name: 'email',
      data: {
        template: 'welcome',
        to: user.email,
        locals: {
          user: select(user.toObject(), Users.schema.options.toJSON.select)
        }
      }
    });
    ctx.logger.debug('queued welcome email', job);
  } catch (err) {
    ctx.logger.error(err);
  }
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
    if (ctx.accepts('json')) {
      ctx.body = {
        message: ctx.translate('PASSWORD_RESET_SENT')
      };
    } else {
      ctx.flash('success', ctx.translate('PASSWORD_RESET_SENT'));
      ctx.redirect('back');
    }

    return;
  }

  // if we've already sent a reset password request in the past half hour
  if (
    user.reset_token_expires_at &&
    user.reset_token &&
    moment(user.reset_token_expires_at).isBefore(moment().add(30, 'minutes'))
  )
    throw Boom.badRequest(
      ctx.translate(
        'PASSWORD_RESET_LIMIT',
        moment(user.reset_token_expires_at).fromNow()
      )
    );

  // set the reset token and expiry
  user.reset_token_expires_at = moment()
    .add(30, 'minutes')
    .toDate();
  user.reset_token = randomstring.token();

  await user.save();

  if (ctx.accepts('json')) {
    ctx.body = {
      message: ctx.translate('PASSWORD_RESET_SENT')
    };
  } else {
    ctx.flash('success', ctx.translate('PASSWORD_RESET_SENT'));
    ctx.redirect('back');
  }

  // queue password reset email
  try {
    const job = await Jobs.create({
      name: 'email',
      data: {
        template: 'reset-password',
        to: user.email,
        locals: {
          user: _.pick(user, [
            config.passport.fields.displayName,
            'reset_token_expires_at'
          ]),
          link: `${config.urls.web}/reset-password/${user.reset_token}`
        }
      }
    });
    ctx.logger.debug('Queued reset password email', job);
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
  const user = await Users.findOne({
    email: body.email,
    reset_token: ctx.params.token,
    // ensure that the reset_at is only valid for 30 minutes
    reset_token_expires_at: {
      $gte: new Date()
    }
  });

  if (!user) throw Boom.badRequest(ctx.translate('INVALID_RESET_PASSWORD'));

  user.reset_token = null;
  user.reset_at = null;

  await user.setPassword(body.password);
  await user.save();
  await ctx.login(user);
  if (ctx.accepts('json')) {
    ctx.body = {
      message: ctx.translate('RESET_PASSWORD'),
      redirectTo: `/${ctx.locale}`
    };
  } else {
    ctx.flash('success', ctx.translate('RESET_PASSWORD'));
    ctx.redirect(`/${ctx.locale}`);
  }
}

async function catchError(ctx, next) {
  try {
    await next();
  } catch (err) {
    if (ctx.params.provider === 'google' && err.message === 'Consent required')
      return ctx.redirect('/auth/google/consent');
    ctx.flash('error', err.message);
    ctx.redirect('/login');
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
  catchError
};
