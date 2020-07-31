const sanitize = require('sanitize-html');
const dayjs = require('dayjs');
const isSANB = require('is-string-and-not-blank');
const Boom = require('@hapi/boom');
const _ = require('lodash');
const validator = require('validator');

const email = require('../../../helpers/email');
const { Inquiries } = require('../../models');
const config = require('../../../config');

async function help(ctx) {
  let { body } = ctx.request;

  if (config.env === 'test') ctx.ip = ctx.ip || '127.0.0.1';

  body = _.pick(body, ['email', 'message']);

  if (!_.isString(body.email) || !validator.isEmail(body.email))
    throw Boom.badRequest(ctx.translateError('INVALID_EMAIL'));

  if (!_.isUndefined(body.message) && !_.isString(body.message))
    delete body.message;

  if (_.isString(body.message))
    body.message = sanitize(body.message, {
      allowedTags: [],
      allowedAttributes: []
    });

  if (_.isString(body.message)) {
    if (!isSANB(body.message))
      throw Boom.badRequest(ctx.translateError('INVALID_MESSAGE'));
    if (body.message.length > config.supportRequestMaxLength)
      throw Boom.badRequest(ctx.translateError('INVALID_MESSAGE'));
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
      $gte: dayjs().subtract(1, 'day').toDate()
    }
  });

  if (count > 0 && config.env !== 'development')
    throw Boom.badRequest(ctx.translateError('SUPPORT_REQUEST_LIMIT'));

  try {
    const inquiry = await Inquiries.create({
      ...body,
      ip: ctx.ip,
      locale: ctx.locale
    });

    ctx.logger.debug('created inquiry', inquiry);

    await email({
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

    const message = ctx.translate('SUPPORT_REQUEST_SENT');
    if (ctx.accepts('html')) {
      ctx.flash('success', message);
      ctx.redirect('back');
    } else {
      ctx.body = { message, resetForm: true, hideModal: true };
    }
  } catch (err) {
    ctx.logger.error(err, { body });
    throw Boom.badRequest(ctx.translateError('SUPPORT_REQUEST_ERROR'));
  }
}

module.exports = help;
