const StackFrame = require('stackframe');
const StackTrace = require('stacktrace-js');
const prepareStackTrace = require('prepare-stack-trace');
const uncaught = require('uncaught');

const logger = require('./logger');

//
// Sourced from the StackTrace example from CabinJS docs
// <https://github.com/cabinjs/cabin#stacktrace>
//

//
// The following override is required until this PR is merged
// <https://github.com/stacktracejs/stackframe/pull/23>
//
StackFrame.prototype.toString = function() {
  const fileName = this.getFileName() || '';
  const lineNumber = this.getLineNumber() || '';
  const columnNumber = this.getColumnNumber() || '';
  const functionName = this.getFunctionName() || '';
  if (this.getIsEval()) {
    if (fileName) {
      return (
        '[eval] (' + fileName + ':' + lineNumber + ':' + columnNumber + ')'
      );
    }

    return '[eval]:' + lineNumber + ':' + columnNumber;
  }

  if (functionName) {
    return (
      functionName +
      ' (' +
      fileName +
      ':' +
      lineNumber +
      ':' +
      columnNumber +
      ')'
    );
  }

  return fileName + ':' + lineNumber + ':' + columnNumber;
};

uncaught.start();
uncaught.addListener(err => {
  // this will transform the error's `stack` property
  // to be consistently similar to Gecko and V8 stackframes
  StackTrace.fromError(err)
    .then(stackframes => {
      err.stack = prepareStackTrace(err, stackframes);
      logger.error(err);
    })
    .catch(err2 => {
      logger.error(err);
      logger.error(err2);
    });
});

module.exports = uncaught;
