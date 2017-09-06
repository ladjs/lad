// inspired by `koa-timeout`
// and refactored for async

const _ = require('lodash');
const Boom = require('boom');

module.exports = function(ms, message) {
  if (!_.isNumber(ms)) throw new Error('`ms` was not a number');

  if (!_.isString(message)) throw new Error('`message` was not a string');

  return (ctx, next) => {
    ctx.req._timeout = null;

    return Promise.race([
      new Promise((resolve, reject) => {
        ctx.req._timeout = setTimeout(() => {
          reject(Boom.clientTimeout(message));
        }, ms);
      }),
      new Promise(async (resolve, reject) => {
        try {
          await next();
          clearTimeout(ctx.req._timeout);
          resolve();
        } catch (err) {
          clearTimeout(ctx.req._timeout);
          reject(err);
        }
      })
    ]);
  };
};
