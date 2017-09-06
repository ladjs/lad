const sanitize = require('sanitize-html');
const moment = require('moment');
const s = require('underscore.string');
const Boom = require('boom');
const _ = require('lodash');
const validator = require('validator');

const { Jobs, Inquiries } = require('../../models');
const config = require('../../../config');

module.exports = async function(ctx) {
  ctx.req.body = _.pick(ctx.req.body, ['email', 'message']);

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

  // check if we already sent a contact request in the past day
  // with this given ip address, otherwise create and email
  const count = await Inquiries.count({
    ip: ctx.req.ip,
    created_at: {
      $gte: moment()
        .subtract(1, 'day')
        .toDate()
    }
  });

  if (count > 0 && config.env !== 'development')
    return ctx.throw(Boom.badRequest(ctx.translate('CONTACT_REQUEST_LIMIT')));

  try {
    const inquiry = await Inquiries.create({
      ...ctx.req.body,
      ip: ctx.req.ip
    });

    // TODO: this might be ctx.log instead?
    // TODO: ensure timestamp is shown on console and saved
    // we may want to use `console-stamp` package
    ctx.logger.info('created inquiry', inquiry);

    const job = await Jobs.create({
      name: 'email',
      data: {
        template: 'inquiry',
        to: ctx.req.body.email,
        cc: config.email.from,
        locals: {
          locale: ctx.req.locale,
          inquiry
        }
      }
    });

    ctx.logger.info('queued inquiry email', job);

    const message = ctx.translate('CONTACT_REQUEST_SENT');
    if (ctx.is('json')) {
      ctx.body = { message };
    } else {
      ctx.flash('success', message);
      ctx.redirect('back');
    }
  } catch (err) {
    // TODO: this should have a `user` object prop
    ctx.logger.error(err, {
      ip: ctx.req.ip,
      message: ctx.req.body.message,
      email: ctx.req.body.email
    });

    ctx.throw(ctx.translate('CONTACT_REQUEST_ERROR'));
  }
};
