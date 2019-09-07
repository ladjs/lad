const StackTrace = require('stacktrace-js');
const uncaught = require('uncaught');

const logger = require('./logger');

uncaught.start();
uncaught.addListener(err => {
  // this will transform the error's `stack` property
  // to be consistently similar to Gecko and V8 stackframes
  StackTrace.fromError(err)
    .then(stackframes => {
      // StackTrace has a convenient `report` method however
      // we want to send along more information than just this
      // <https://github.com/stacktracejs/stacktrace.js#stacktracereportstackframes-url-message-requestoptions--promisestring>
      // StackTrace.report(stackframes, endpoint, err.message);
      // however we want to leave it up to the logger to
      // report and record the error
      err.stack = stackframes;
      logger.error(err);
    })
    .catch(err2 => {
      // log both original and new error
      logger.error(err);
      logger.error(err2);
    });
});

module.exports = uncaught;
