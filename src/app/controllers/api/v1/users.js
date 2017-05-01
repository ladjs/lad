
import s from 'underscore.string';
import Boom from 'boom';
import _ from 'lodash';

import { logger } from '../../../../helpers';
import Users from '../../../models/user';

export async function retrieve(ctx) {
  // since we already have the user object
  // just send it over as a response
  ctx.body = ctx.state.user;
}

export async function update(ctx) {

  // set fields we allow to be updated
  const fields = [
    'email',
    'display_name',
    'given_name',
    'family_name',
    'avatar_url'
  ];

  // extend the user object
  // (basically overwrites or "extends" the existing fields)
  ctx.state.user = _.extend(ctx.state.user, _.pick(ctx.req.body, fields));

  // save the user (allow mongoose to handle validation)
  ctx.state.user = await ctx.state.user.save();

  // send the response
  ctx.body = ctx.state.user;

}

export async function checkLicenseKey(ctx, next) {

  if (!_.isString(ctx.params.license_key) || s.isBlank(ctx.params.license_key))
    return ctx.throw(Boom.badRequest(ctx.translate('INVALID_LICENSE_KEY')));

  try {
    const user = await Users.findOne({
      'licenses.key': ctx.params.key
    });
    ctx.body = _.pick(user, [ 'license' ]);
  } catch (err) {
    logger.error(err);
    ctx.throw(Boom.badRequest(ctx.translate('INVALID_LICENSE_KEY')));
  }

}
