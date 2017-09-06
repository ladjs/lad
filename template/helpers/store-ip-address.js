const _ = require('lodash');

const logger = require('./logger');

module.exports = function(ctx, next) {
  // return early if the user is not authenticated
  // or if the user's last ip changed then don't do anything
  if (!ctx.isAuthenticated() || ctx.state.user.ip === ctx.req.ip) return next();

  // set the user's IP to the current one
  // make sure the IP's saved are unique
  ctx.state.user.ip = ctx.req.ip;
  ctx.state.user.last_ips.push(ctx.req.ip);
  ctx.state.user.last_ips = _.uniq(ctx.state.user.last_ips);
  ctx.state.user.save(err => {
    if (err) return logger.error(err);
  });

  return next();
};
