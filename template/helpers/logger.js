const _ = require('lodash');
const s = require('underscore.string');
const chalk = require('chalk');

const config = require('../config');

// TODO: incorporate cabin log levels
//
// * `debug` (the least serious)
// * `info`
// * `warning`
// * `error`
// * `fatal` (the most serious)
const levels = {
  debug: 'cyan',
  info: 'green',
  warning: 'yellow',
  error: 'red',
  fatal: 'bgRed'
};

const logger = {};

// TODO: rewrite this with better log parsing by cabin
logger.contextError = function(err) {
  // , ctx) {
  console.log(err && err.stack);
  // TODO: add user object and request to meta here
  logger.error(err);
};

logger.log = function(level, message, meta) {
  if (level === 'warn') level = 'warning';
  if (level === 'err') level = 'error';

  if (!_.isString(level) || !_.includes(_.keys(levels), level)) {
    throw new Error(
      `\`level\` must be a string and one of ${_.keys(levels).join(', ')}`
    );
  }

  meta = meta || {};

  // TODO: put in cabin here
  // use kwargs parsing from sentry to get user and request info
  // TODO: handle sentry/bugsnag normalization here

  if (_.isError(message)) {
    if (!_.isObject(meta.err))
      meta.err = { stack: message.stack, message: message.message };
    message = message.message;
  }

  // set default level on meta
  meta.level = level;

  if (!_.isString(message) || s.isBlank(message))
    throw new Error('`message` must be a string and not empty');

  /*
  // TODO: send to cabin / sentry / bugsnag here
  if (config.env === 'production') {
    if (level === 'error' || level === 'fatal')
      return sentry.captureException(message, meta);

    sentry.captureMessage(message, meta);
  }
  */

  console.log(`${chalk[levels[level]](level)}: ${message}`);

  if (!config.showStack) return;
  if (!_.isEmpty(meta.extra)) console.log(meta.extra);
  if (!_.isEmpty(meta.user)) console.log(meta.user);
};

// bind helper functions for each log level
_.each(_.keys(levels), level => {
  logger[level] = (message, extra) => {
    logger.log(level, message, extra);
  };
});

// aliases
logger.err = logger.error;
logger.warn = logger.warning;

module.exports = logger;
