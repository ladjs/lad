
import _ from 'lodash';
import Stripe from 'stripe';
import s from 'underscore.string';
import Boom from 'boom';

import config from '../../../config';
import { logger } from '../../../helpers';
// import { Users, Jobs } from '../../models';

const stripe = new Stripe(config.stripe.secretKey);

export default async function purchaseLicense(ctx) {

  // filter body
  const body = _.pick(ctx.req.body, [
    'num_licenses',
    'stripe_token'
  ]);

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

  // charge user on stripe
  const charge = await stripe.charges.create({
    amount,
    currency: 'usd',
    source: body.stripe_token
  });

  logger.info('Created charge', charge);

  ctx.throw('foobar');

  // TODO: save to user the licenses
  //
  // TODO: send the user an email
  //
  // TODO: register the user if they aren't registered
  // and send the user a temporary password that needs changed
  // upon the user being logged in

}
