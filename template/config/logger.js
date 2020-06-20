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
          },
          hooks: {
            // <https://github.com/pinojs/pino/blob/master/docs/api.md#logmethod>
            logMethod(inputArgs, method) {
              return method.call(this, {
                // <https://github.com/pinojs/pino/issues/854>
                // message: inputArgs[0],
                msg: inputArgs[0],
                meta: inputArgs[1]
              });
            }
          }
        })
      : new Signale()
};
