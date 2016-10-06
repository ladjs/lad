
import sanitize from 'sanitize-html';
import moment from 'moment';
import s from 'underscore.string';
import Boom from 'boom';
import _ from 'lodash';
import validator from 'validator';

import { Jobs, Inquiries } from '../../models';
import { logger } from '../../../helpers';
import config from '../../../config';

export default async function contact(ctx) {

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

    logger.info('Created inquiry', inquiry);

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

    logger.info('Queued inquiry email', job);

    inquiry.job = job._id;
    await inquiry.save();

    if (ctx.is('json')) {
      ctx.body = {
        message: ctx.translate('CONTACT_REQUEST_SENT'),
        reloadPage: true
      };
    } else {
      ctx.flash('success', ctx.translate('CONTACT_REQUEST_SENT'));
      ctx.redirect('back');
    }

  } catch (err) {

    logger.error(err, {
      ip: ctx.req.ip,
      message: ctx.req.body.message,
      email: ctx.req.body.email
    });

    ctx.throw(ctx.translate('CONTACT_REQUEST_ERROR'));

  }

}
