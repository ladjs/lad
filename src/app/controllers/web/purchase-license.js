
import uuid from 'uuid';
import _ from 'lodash';
import Stripe from 'stripe';
import s from 'underscore.string';
import Boom from 'boom';
import validator from 'validator';

import config from '../../../config';
import { logger } from '../../../helpers';
import { Users, Jobs } from '../../models';

const stripe = new Stripe(config.stripe.secretKey);

export default async function purchaseLicense(ctx) {

  // filter body
  const body = _.pick(ctx.req.body, [
    'num_licenses',
    'stripe_token',
    'stripe_email'
  ]);

  // ensure email passed is a valid email address
  if (!_.isString(body.stripe_email) || !validator.isEmail(body.stripe_email))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_EMAIL')));

  // ensure number of licenses exists
  if (!_.isString(body.num_licenses) || s.isBlank(body.num_licenses))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_NUM_LICENSES')));

  // convert string to whole number
  body.num_licenses = parseInt(body.num_licenses, 10);

  // ensure num_licenses is a number greater than 0
  if (!_.isNumber(body.num_licenses) || body.num_licenses <= 0)
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_NUM_LICENSES')));

  // determine the discounts we're offering
  const discounts = {
    '1': 0,
    // 12% for 5 licenses
    '5': 0.12,
    // 24% for 10 licenses
    '10': 0.24
  };

  // get the closest discount based on # of licenses
  // <http://stackoverflow.com/a/12071084>/
  const discount = Math.max(..._.filter(discounts, (discount, num) => {
    return parseInt(num, 10) <= body.num_licenses;
  }));

  // calculate how much we're going to charge in cents
  const amount = parseInt(
    body.num_licenses *
    config.licenseCostDollars *
    (1 - discount) *
    100,
    10
  );

  // ensure stripe token exists
  if (!_.isString(body.stripe_token) || s.isBlank(body.stripe_token))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_STRIPE_TOKEN')));

  // create the licenses
  let licenses = _.times(body.num_licenses, (i) => {
    return {
      created_at: Date.now(),
      key: uuid.v4(),
      desc: `${i + 1}/${body.num_licenses} license${body.num_licenses > 1 ? 's' : ''}`,
      amount: amount / body.num_licenses
    };
  });

  // charge user on stripe and prevent user
  // from seeing the third party api response
  let charge;

  try {

    charge = await stripe.charges.create({
      amount,
      currency: 'usd',
      source: body.stripe_token
    });

    logger.info('Created charge', charge);

    // store the stripe charge id to each license created
    licenses = _.map(licenses, license => {
      license.stripe_charge_id = charge.id;
      return license;
    });

    // if the user is not logged in then
    // either find their user object or register
    if (!ctx.req.isAuthenticated()) {
      ctx.req.user = await Users.findOne({
        email: body.stripe_email
      });
      if (!ctx.req.user)
        ctx.req.user = await Users.create({
          email: body.stripe_email
        });
      ctx.req.user.last_locale = ctx.req.locale;
    }

    // set that they have purchased a license
    ctx.req.user.has_license = true;

    // set the licenses
    ctx.req.user.licenses = _.concat(
      ctx.req.user.licenses,
      licenses
    );

    // save the user
    await ctx.req.user.save();

    logger.info('Saved license(s) to user');

    // send out individual emails for each
    // license that was purchased by the user
    const promises = _.map(licenses, (license, i) => {
      return Jobs.create({
        name: 'email',
        data: {
          template: 'purchase-license',
          to: ctx.req.user.email,
          cc: config.email.from,
          locals: {
            locale: ctx.req.locale,
            user: _.pick(ctx.req.user, 'display_name'),
            licenses,
            license,
            i
          }
        }
      });
    });

    // send the user an email receipt
    const jobs = await Promise.all(promises);

    logger.info('Queued purchase-license email(s)', jobs);

    const message = ctx.translate('PURCHASE_LICENSE_SENT');
    if (ctx.is('json')) {
      ctx.body = { message };
    } else {
      ctx.flash('success', message);
      ctx.redirect('back');
    }

  } catch (err) {

    // if any errors occurred then refund the charge
    // immediately if it was created and remove licenses
    if (charge) {
      try {
        await stripe.refunds.create({ charge: charge.id });
      } catch (err) {
        logger.error(err);
      }
    }

    // remove any licenses that were created
    if (_.isObject(ctx.req.user)) {

      // exclude any licenses that were just added
      ctx.req.user.licenses = _.filter(ctx.req.user.licenses, license => {
        return !_.includes(_.pluck(licenses, 'key'), license.key);
      });

      try {
        await ctx.req.user.save();
      } catch (err) {
        logger.error(err);
      }

    }

    // TODO: handle the stripe error (if any) with a helper
    // <https://github.com/stripe/stripe-node/wiki/Error-Handling>

    ctx.throw(Boom.badRequest(err));

  }


}
