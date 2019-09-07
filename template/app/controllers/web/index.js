const titleize = require('titleize');
const _ = require('lodash');

const support = require('./support');
const auth = require('./auth');
const admin = require('./admin');
const myAccount = require('./my-account');
const log = require('./log');

function breadcrumbs(ctx, next) {
  const breadcrumbs = _.compact(ctx.path.split('/')).slice(1);
  ctx.state.breadcrumbs = breadcrumbs;
  ctx.state.meta.title = ctx.request.t(
    breadcrumbs.length === 1
      ? titleize(breadcrumbs[0])
      : `${titleize(breadcrumbs[0])} - ${titleize(breadcrumbs[1])}`
  );
  return next();
}

module.exports = { support, auth, admin, myAccount, breadcrumbs, log };
