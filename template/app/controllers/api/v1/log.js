const auth = require('basic-auth');
const parseLogs = require('parse-logs');

const policies = require('../../../../helpers/policies');

async function parseLog(ctx) {
  ctx.body = 'OK';
  try {
    const log = parseLogs(ctx.request);
    ctx.logger[log.meta.level](log.message, log.meta);
  } catch (err) {
    ctx.logger.error(err);
  }
}

async function checkToken(ctx, next) {
  try {
    await policies.ensureApiToken(ctx, next);
  } catch (err) {
    const credentials = auth(ctx.req);
    if (typeof credentials !== 'undefined') ctx.logger.error(err);
    return next();
  }
}

module.exports = { parseLog, checkToken };
