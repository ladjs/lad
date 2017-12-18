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

  if (config.env === 'test') ctx.ip = ctx.ip || '127.0.0.1';

  body = _.pick(body, ['email', 'message']);

  if (!_.isString(body.email) || !validator.isEmail(body.email))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_EMAIL')));

  if (!_.isUndefined(body.message) && !_.isString(body.message)) delete body.message;

  if (_.isString(body.message))
    body.message = sanitize(body.message, {
      allowedTags: [],
      allowedAttributes: []
    });

  if (_.isString(body.message) && s.isBlank(body.message))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_MESSAGE')));

  if (!_.isString(body.message)) {
    body.message = ctx.translate('SUPPORT_REQUEST_MESSAGE');
    body.is_email_only = true;
  } else if (body.message.length > config.supportRequestMaxLength) {
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_MESSAGE')));
  }

  // check if we already sent a support request in the past day
  // with this given ip address or email, otherwise create and email
  const count = await Inquiries.count({
    $or: [
      {
        ip: ctx.ip
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
    return ctx.throw(Boom.badRequest(ctx.translate('SUPPORT_REQUEST_LIMIT')));

  try {
    const inquiry = await Inquiries.create({
      ...body,
      ip: ctx.ip
    });

    ctx.logger.debug('created inquiry', inquiry);

    const job = await Jobs.create({
      name: 'email',
      data: {
        template: 'inquiry',
        to: body.email,
        cc: config.email.from,
        locals: {
          locale: ctx.locale,
          inquiry
        }
      }
    });

    ctx.logger.debug('queued inquiry email', job);

    const message = ctx.translate('SUPPORT_REQUEST_SENT');
    if (ctx.accepts('json')) {
      ctx.body = { message };
    } else {
      ctx.flash('success', message);
      ctx.redirect('back');
    }
  } catch (err) {
    ctx.logger.error(err, { body });
    ctx.throw(ctx.translate('SUPPORT_REQUEST_ERROR'));
  }
};
