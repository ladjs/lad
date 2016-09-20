
import sanitize from 'sanitize-html';
import promisify from 'es6-promisify';
import moment from 'moment';
import s from 'underscore.string';
import randomstring from 'randomstring-extended';
import Boom from 'boom';
import _ from 'lodash';
import validator from 'validator';

import Users from '../../models/user';
import Jobs from '../../models/job';
import Inquiries from '../../models/inquiry';
import { Logger, passport } from '../../../helpers';
import config from '../../../config';

export default class Web {

  static async contact(ctx) {

    ctx.req.body = _.pick(ctx.req.body, [ 'email', 'message' ]);

    if (!_.isString(ctx.req.body.email) || !validator.isEmail(ctx.req.body.email))
      return ctx.throw(Boom.badRequest(ctx.translate('INVALID_EMAIL')));

    if (!_.isUndefined(ctx.req.body.message) && !_.isString(ctx.req.body.message))
      delete ctx.req.body.message;

    if (ctx.req.body.message)
      ctx.req.body.message = sanitize(ctx.req.body.message, {
        allowedTags: [],
        allowedAttributes: []
      });

    if (ctx.req.body.message && s.isBlank(ctx.req.body.message))
      return ctx.throw(Boom.badRequest(ctx.translate('INVALID_MESSAGE')));

    if (!ctx.req.body.message) {
      ctx.req.body.message = ctx.translate('CONTACT_REQUEST_MESSAGE');
      ctx.req.body.is_email_only = true;
    } else if (ctx.req.body.message.length > config.contactRequestMaxLength) {
      return ctx.throw(Boom.badRequest(ctx.translate('INVALID_MESSAGE')));
    }

    if (_.isUndefined(ctx.req.ip) && config.env === 'development')
      ctx.req.ip = '127.0.0.1';

    // check if we already sent a contact request in the past day
    // with this given ip address, otherwise create and email
    const count = await Inquiries.count({
      ip: ctx.req.ip,
      created_at: {
        $gte: moment().subtract(1, 'day').toDate()
      }
    });

    if (count > 0)
      return ctx.throw(Boom.badRequest(ctx.translate('CONTACT_REQUEST_LIMIT')));

    try {

      const inquiry = await Inquiries.create({
        ... ctx.req.body,
        ip: ctx.req.ip
      });

      Logger.info('Created inquiry', inquiry);

      const job = await Jobs.create({
        name: 'email',
        data: {
          template: 'inquiry',
          to: ctx.req.body.email,
          cc: config.email.from,
          locals: {
            inquiry
          }
        }
      });

      Logger.info('Queued inquiry email', job);

      inquiry.job = job._id;
      await inquiry.save();

      ctx.flash('success', ctx.translate('CONTACT_REQUEST_SENT'));

    } catch (err) {

      Logger.error(err, {
        ip: ctx.req.ip,
        message: ctx.req.body.message,
        email: ctx.req.body.email
      });

      ctx.flash('error', ctx.translate('CONTACT_REQUEST_ERROR'));

    } finally {
      ctx.redirect('back');
    }


  }

  static async home(ctx, next) {
    const referrer = ctx.get('referrer');
    if ([ 'https://news.ycombinator.com', 'https://www.producthunt.com' ].includes(referrer))
      ctx.flash('success', 'Welcome Hacker News and Product Hunt friends!');
    await ctx.render('home');
  }

  static async signupOrLogin(ctx) {
    ctx.state.verb = ctx.path === '/signup' ? 'sign up' : 'log in';
    await ctx.render('signup-or-login');
  }

  static status(ctx) {
    ctx.body = { status: 'online' };
  }

  static async login(ctx, next) {

    try {

      await passport.authenticate('local', function (user, info, status) {

        return new Promise((resolve, reject) => {

          let redirectTo = config.auth.callbackOpts.successReturnToOrRedirect;

          if (ctx.session && ctx.session.returnTo) {
            redirectTo = ctx.session.returnTo;
            delete ctx.session.returnTo;
          }

          if (user) {
            if (ctx.is('json')) {
              ctx.body = {
                message: ctx.translate('LOGGED_IN'),
                redirectTo: redirectTo
              };
            } else {
              ctx.flash('success', ctx.translate('LOGGED_IN'));
              ctx.redirect(redirectTo);
              // TODO: ctx.login(user);
            }
            return resolve();
          }

          if (info)
            return reject(info);

          reject(ctx.translate('UNKNOWN_ERROR'));

        });

      })(ctx, next);

    } catch (err) {
      ctx.throw(err);
    }

  }

  static async register(ctx, next) {

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
            ctx.flash('success', ctx.translate('REGISTERED'));
            resolve();
            // add welcome email job
            try {
              const job = await Jobs.create({
                name: 'email',
                data: {
                  template: 'welcome',
                  to: user.email,
                  locals: {
                    name: user.given_name
                  }
                }
              });
              Logger.info('Queued welcome email', job);
            } catch (err) {
              Logger.error(err);
            }
          }
        );
      });
      return next();
    } catch (err) {
      ctx.throw(Boom.badRequest(err.message));
    }

  }

  static async forgotPassword(ctx) {

    if (!_.isString(ctx.req.body.email) || !validator.isEmail(ctx.req.body.email))
      return ctx.throw(Boom.badRequest(ctx.translate('INVALID_EMAIL')));

    // lookup the user
    const user = await Users.findOne({ email: ctx.req.body.email });

    // to prevent people from being able to find out valid email accounts
    // we always say "a password reset request has been sent to your email address"
    // and if the email didn't exist in our system them we simply don't send it
    if (!user) {
      ctx.flash('success', ctx.translate('PASSWORD_RESET_SENT'));
      ctx.redirect('back');
      return;
    }

    // set the reset token and expiry
    user.reset_token_expires_at = moment().add(30, 'minutes').toDate();
    user.reset_token = randomstring.token();

    await user.save();

    // TODO: FIX THIS
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
            name: user.given_name
          }
        }
      });
      Logger.info('Queued reset password email', job);
    } catch (err) {
      Logger.error(err);
    }

  }

  static async resetPassword(ctx) {

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
      ctx.flash('success', ctx.translate('RESET_PASSWORD'));
      await promisify(ctx.req.logIn, ctx.req)(user);
      ctx.redirect('/');
    }

  }

}
