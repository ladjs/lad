const sanitize = require('sanitize-html');
const moment = require('moment');
const s = require('underscore.string');
const Boom = require('boom');
const _ = require('lodash');
const validator = require('validator');

const { Jobs, Inquiries } = require('../../models');
const config = require('../../../config');

module.exports = async function(ctx) {
  let { body } = ctx.request;

  // @TODO: Remove this once store ip is fixed
  if (config.env === 'test') ctx.req.ip = ctx.req.ip || '127.0.0.1';

  body = _.pick(body, ['email', 'message']);

  if (!_.isString(body.email) || !validator.isEmail(body.email))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_EMAIL')));

  if (!_.isUndefined(body.message) && !_.isString(body.message)) delete body.message;

  if (body.message)
    body.message = sanitize(body.message, {
      allowedTags: [],
      allowedAttributes: []
    });

  if (body.message && s.isBlank(body.message))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_MESSAGE')));

  if (!body.message) {
    body.message = ctx.translate('CONTACT_REQUEST_MESSAGE');
    body.is_email_only = true;
  } else if (body.message.length > config.contactRequestMaxLength) {
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_MESSAGE')));
  }

  // check if we already sent a contact request in the past day
  // with this given ip address or email, otherwise create and email
  const count = await Inquiries.count({
    $or: [
      {
        ip: ctx.req.ip
      },
      {
        email: body.email
      }
    ],
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
      ...body,
      ip: ctx.req.ip
    });

    // TODO: ensure timestamp is shown on console and saved
    // we may want to use `console-stamp` package
    ctx.logger.info('created inquiry', inquiry);

    const job = await Jobs.create({
      name: 'email',
      data: {
        template: 'inquiry',
        to: body.email,
        cc: config.email.from,
        locals: {
          locale: ctx.req.locale,
          inquiry
        }
      }
    });

    ctx.logger.info('queued inquiry email', job);

    const message = ctx.translate('CONTACT_REQUEST_SENT');
    if (ctx.accepts('json')) {
      ctx.body = { message };
    } else {
      ctx.flash('success', message);
      ctx.redirect('back');
    }
  } catch (err) {
    // TODO: this should have a `user` object prop
    ctx.logger.error(err, {
      ip: ctx.req.ip,
      message: body.message,
      email: body.email
    });

    ctx.throw(ctx.translate('CONTACT_REQUEST_ERROR'));
  }
};
