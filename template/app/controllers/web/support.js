const sanitize = require('sanitize-html');
const moment = require('moment');
const isSANB = require('is-string-and-not-blank');
const Boom = require('@hapi/boom');
const _ = require('lodash');
const validator = require('validator');

const bull = require('../../../bull');
const { Inquiries } = require('../../models');
const config = require('../../../config');

async function support(ctx) {
  let { body } = ctx.request;

  if (config.env === 'test') ctx.ip = ctx.ip || '127.0.0.1';

  body = _.pick(body, ['email', 'message']);

  if (!_.isString(body.email) || !validator.isEmail(body.email))
    throw Boom.badRequest(ctx.translate('INVALID_EMAIL'));

  if (!_.isUndefined(body.message) && !_.isString(body.message))
    delete body.message;

  if (_.isString(body.message))
    body.message = sanitize(body.message, {
      allowedTags: [],
      allowedAttributes: []
    });

  if (_.isString(body.message)) {
    if (!isSANB(body.message))
      throw Boom.badRequest(ctx.translate('INVALID_MESSAGE'));
    if (body.message.length > config.supportRequestMaxLength)
      throw Boom.badRequest(ctx.translate('INVALID_MESSAGE'));
  } else {
    body.message = ctx.translate('SUPPORT_REQUEST_MESSAGE');
    body.is_email_only = true;
  }

  // check if we already sent a support request in the past day
  // with this given ip address or email, otherwise create and email
  const count = await Inquiries.countDocuments({
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
    throw Boom.badRequest(ctx.translate('SUPPORT_REQUEST_LIMIT'));

  try {
    const inquiry = await Inquiries.create({
      ...body,
      ip: ctx.ip
    });

    ctx.logger.debug('created inquiry', inquiry);

    const job = await bull.add('email', {
      template: 'inquiry',
      message: {
        to: body.email,
        cc: config.email.message.from
      },
      locals: {
        locale: ctx.locale,
        inquiry
      }
    });

    ctx.logger.info('added job', bull.getMeta({ job }));

    const message = ctx.translate('SUPPORT_REQUEST_SENT');
    if (ctx.accepts('html')) {
      ctx.flash('success', message);
      ctx.redirect('back');
    } else {
      ctx.body = { message, resetForm: true };
    }
  } catch (err) {
    ctx.logger.error(err, { body });
    throw Boom.badRequest(ctx.translate('SUPPORT_REQUEST_ERROR'));
  }
}

module.exports = support;
