const StackTrace = require('stacktrace-js');
const prepareStackTrace = require('prepare-stack-trace');
const uncaught = require('uncaught');

const logger = require('./logger');

//
// Sourced from the StackTrace example from CabinJS docs
// <https://github.com/cabinjs/cabin#stacktrace>
//
uncaught.start();
uncaught.addListener(async (err, event) => {
  if (!err) {
    if (typeof ErrorEvent === 'function' && event instanceof ErrorEvent)
      return logger.error(event.message, { event });
    logger.error({ event });
    return;
  }

  // this will transform the error's `stack` property
  // to be consistently similar to Gecko and V8 stackframes
  try {
    const stackframes = await StackTrace.fromError(err);
    err.stack = prepareStackTrace(err, stackframes);
    logger.error(err);
  } catch (err_) {
    logger.error(err);
    logger.error(err_);
  }
});

module.exports = uncaught;
