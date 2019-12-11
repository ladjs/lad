const StackTrace = require('stacktrace-js');
const prepareStackTrace = require('prepare-stack-trace');
const uncaught = require('uncaught');

const logger = require('./logger');

//
// Sourced from the StackTrace example from CabinJS docs
// <https://github.com/cabinjs/cabin#stacktrace>
//
uncaught.start();
uncaught.addListener(err => {
  // this will transform the error's `stack` property
  // to be consistently similar to Gecko and V8 stackframes
  StackTrace.fromError(err)
    .then(stackframes => {
      err.stack = prepareStackTrace(err, stackframes);
      logger.error(err);
    })
    .catch(err_ => {
      logger.error(err);
      logger.error(err_);
    });
});

module.exports = uncaught;
