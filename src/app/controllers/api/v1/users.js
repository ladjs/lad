
import s from 'underscore.string';
import Boom from 'boom';
import _ from 'lodash';

import { Logger } from '../../../../helpers';
import UsersModel from '../../../models/user';

export default class UsersController {

  static async retrieve(ctx) {
    // since we already have the user object
    // just send it over as a response
    ctx.body = ctx.req.user;
  }

  static async update(ctx) {

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
    ctx.req.user = _.extend(ctx.req.user, _.pick(ctx.req.body, fields));

    // save the user (allow mongoose to handle validation)
    ctx.req.user = await ctx.req.user.save();

    // send the response
    ctx.body = ctx.req.user;

  }

  static async checkLicenseKey(ctx, next) {

    if (!_.isString(ctx.params.license_key) || s.isBlank(ctx.params.license_key))
      return ctx.throw(Boom.badRequest(ctx.translate('INVALID_LICENSE_KEY')));

    try {
      const user = await UsersModel.findOne({
        'license.key': ctx.params.key
      });
      ctx.body = _.pick(user, [ 'license' ]);
    } catch (err) {
      Logger.error(err);
      return ctx.throw(Boom.badRequest(ctx.translate('INVALID_LICENSE_KEY')));
    }

  }

}
