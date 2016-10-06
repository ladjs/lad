
import promisify from 'es6-promisify';
import moment from 'moment';
import s from 'underscore.string';
import randomstring from 'randomstring-extended';
import Boom from 'boom';
import _ from 'lodash';
import validator from 'validator';

import { Users, Jobs } from '../../models';
import { logger, passport } from '../../../helpers';
import config from '../../../config';

export async function logout(ctx) {
  ctx.logout();
  ctx.redirect(`/${ctx.req.locale}`);
}

export async function signupOrLogin(ctx) {

  // if the user passed `?return_to` and it is not blank
  // then set it as the returnTo value for when we log in
  if (_.isString(ctx.query.return_to) && !s.isBlank(ctx.query.return_to))
    ctx.session.returnTo = ctx.query.return_to;
  // in case people had a typo, we should support redirect_to as well
  else if (_.isString(ctx.query.redirect_to) && !s.isBlank(ctx.query.redirect_to))
    ctx.session.returnTo = ctx.query.redirect_to;

  ctx.state.verb = ctx.path.replace(`/${ctx.req.locale}`, '') === '/signup' ?
    'sign up' : 'log in';

  await ctx.render('signup-or-login');

}

export async function login(ctx, next) {

  try {

    await passport.authenticate('local', function (user, info, status) {

      return new Promise(async (resolve, reject) => {

        let redirectTo = `/${ctx.req.locale}${config.auth.callbackOpts.successReturnToOrRedirect}`;

        if (ctx.session && ctx.session.returnTo) {
          redirectTo = ctx.session.returnTo;
          delete ctx.session.returnTo;
        }

        if (user) {

          try {
            await ctx.login(user);
          } catch (err) {
            return reject(err);
          }

          if (ctx.is('json')) {
            ctx.body = {
              message: ctx.translate('LOGGED_IN'),
              redirectTo,
              autoRedirect: true
            };
          } else {
            ctx.flash('success', ctx.translate('LOGGED_IN'));
            ctx.redirect(redirectTo);
          }

          return resolve();

        }

        if (info)
          return reject(info);

        reject(ctx.translate('UNKNOWN_ERROR'));

      });

    })(ctx, next);

  } catch (err) {
    ctx.throw(Boom.badRequest(err.message));
  }

}

export async function register(ctx, next) {

  if (!_.isString(ctx.req.body.email) || !validator.isEmail(ctx.req.body.email))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_EMAIL')));

  if (!_.isString(ctx.req.body.password) || s.isBlank(ctx.req.body.password))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_PASSWORD')));

  // register the user
  try {
    await new Promise((resolve, reject) => {
      Users.register(
        { email: ctx.req.body.email },
        ctx.req.body.password,
        async (err, user) => {

          if (err) return reject(err);

          let redirectTo = config.auth.callbackOpts.successReturnToOrRedirect;

          if (ctx.session && ctx.session.returnTo) {
            redirectTo = ctx.session.returnTo;
            delete ctx.session.returnTo;
          }

          if (ctx.is('json')) {
            ctx.body = {
              message: ctx.translate('REGISTERED'),
              redirectTo
            };
          } else {
            ctx.flash('success', ctx.translate('REGISTERED'));
            ctx.redirect(redirectTo);
          }

          resolve();

          // add welcome email job
          try {
            const job = await Jobs.create({
              name: 'email',
              data: {
                template: 'welcome',
                to: user.email,
                locals: {
                  name: user.display_name
                }
              }
            });
            logger.info('Queued welcome email', job);
          } catch (err) {
            logger.error(err);
          }
        }
      );
    });
    return next();
  } catch (err) {
    ctx.throw(Boom.badRequest(err.message));
  }

}

export async function forgotPassword(ctx) {

  if (!_.isString(ctx.req.body.email) || !validator.isEmail(ctx.req.body.email))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_EMAIL')));

  // lookup the user
  const user = await Users.findOne({ email: ctx.req.body.email });

  // to prevent people from being able to find out valid email accounts
  // we always say "a password reset request has been sent to your email address"
  // and if the email didn't exist in our system them we simply don't send it
  if (!user) {
    if (ctx.is('json')) {
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
  if (user.reset_token_expires_at
    && user.reset_token
    && moment(user.reset_token_expires_at).isBefore(moment().add(30, 'minutes')))
    return ctx.throw(Boom.badRequest(
      ctx.translate('PASSWORD_RESET_LIMIT', moment(user.reset_token_expires_at).fromNow())
    ));

  // set the reset token and expiry
  user.reset_token_expires_at = moment().add(30, 'minutes').toDate();
  user.reset_token = randomstring.token();

  await user.save();

  if (ctx.is('json')) {
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
          reset_token_expires_at: user.reset_token_expires_at,
          link: `${config.urls.web}/reset-password/${user.reset_token}`,
          name: user.display_name
        }
      }
    });
    logger.info('Queued reset password email', job);
  } catch (err) {
    logger.error(err);
  }

}

export async function resetPassword(ctx) {

  if (!_.isString(ctx.req.body.email) || !validator.isEmail(ctx.req.body.email))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_EMAIL')));

  if (!_.isString(ctx.req.body.password) || s.isBlank(ctx.req.body.password))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_PASSWORD')));

  if (!_.isString(ctx.params.token) || s.isBlank(ctx.params.token))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_RESET_TOKEN')));

  // lookup the user that has this token and if it matches the email passed
  const user = await Users.findOne({
    email: ctx.req.body.email,
    reset_token: ctx.params.token,
    // ensure that the reset_at is only valid for 30 minutes
    reset_token_expires_at: {
      $gte: new Date()
    }
  });

  if (!user)
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_RESET_PASSWORD')));

  user.reset_token = null;
  user.reset_at = null;

  try {
    await promisify(user.setPassword, user)(ctx.req.body.password);
  } catch (err) {
    ctx.throw(Boom.badRequest(ctx.translate('INVALID_PASSWORD_STRENGTH')));
  } finally {
    await user.save();
    await promisify(ctx.req.logIn, ctx.req)(user);
    if (ctx.is('json')) {
      ctx.body = {
        message: ctx.translate('RESET_PASSWORD'),
        redirectTo: `/${ctx.req.locale}`
      };
    } else {
      ctx.flash('success', ctx.translate('RESET_PASSWORD'));
      ctx.redirect(`/${ctx.req.locale}`);
    }
  }

}
