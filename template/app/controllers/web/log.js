const parseLogs = require('parse-logs');

async function log(ctx) {
  ctx.body = 'OK';
  try {
    const log = parseLogs(ctx.request);
    ctx.logger[log.meta.level](log.message, log.meta);
  } catch (err) {
    ctx.logger.error(err);
  }
}

module.exports = log;
