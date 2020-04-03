const pino = require('pino');
const { Signale } = require('signale');

const env = require('./env');

module.exports = {
  showStack: env.SHOW_STACK,
  showMeta: env.SHOW_META,
  name: env.APP_NAME,
  level: 'debug',
  capture: false,
  logger:
    env.NODE_ENV === 'production'
      ? pino({
          customLevels: {
            log: 30
          }
        })
      : new Signale()
};
