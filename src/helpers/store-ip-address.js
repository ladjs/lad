
import _ from 'lodash';

import logger from './logger';

export default async function storeIPAddress(ctx, next) {

  try {

    await new Promise(async (resolve, reject) => {

      resolve();

      // return early if the user is not authenticated
      if (!ctx.isAuthenticated())
        return;

      try {
        // set the user's IP to the current one
        // make sure the IP's saved are unique
        ctx.state.user.ip = ctx.req.ip;
        ctx.state.user.last_ips.push(ctx.req.ip);
        ctx.state.user.last_ips = _.uniq(ctx.state.user.last_ips);
        await ctx.state.user.save();
      } catch (err) {
        logger.error(err);
      }

    });

    return next();

  } catch (err) {
    ctx.throw(err);
  }

}
