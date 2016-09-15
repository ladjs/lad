
import promisify from 'es6-promisify';
import moment from 'moment';
import s from 'underscore.string';
import randomstring from 'randomstring-extended';
import Boom from 'boom';
import _ from 'lodash';
import validator from 'validator';

import Users from '../../models/user';
import Jobs from '../../models/job';
import { Logger } from '../../../helpers';
import config from '../../../config';

export default class Web {

  static async home(ctx) {
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

  static async register(ctx) {

    if (!_.isString(ctx.req.body.email) || !validator.isEmail(ctx.req.body.email))
      return ctx.throw(Boom.badRequest(ctx.translate('INVALID_EMAIL')));

    if (!_.isString(ctx.req.body.password) || s.isBlank(ctx.req.body.password))
      return ctx.throw(Boom.badRequest(ctx.translate('INVALID_PASSWORD')));

    // register the user
    Users.register(
      { email: ctx.req.body.email },
      ctx.req.body.password,
      (err, user) => {
        if (err) return ctx.throw(err);
        ctx.flash('success', ctx.translate('REGISTERED'));
        ctx.redirect('/');
      }
    );

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

    ctx.flash('success', ctx.translate('PASSWORD_RESET_SENT'));
    ctx.redirect('back');

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
      Logger.info('Queued reset password', job);
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
