
import _ from 'lodash';

export default class Users {

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

}
