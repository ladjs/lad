
// base URI for everything
global._options = {
  baseURI: 'http://localhost:8080',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
};

// setup global chai methods
import chai from 'chai';
import dirtyChai from 'dirty-chai';
import checkChai from 'check-chai';
chai.config.includeStack = true;
chai.config.showDiff = true;
chai.use(dirtyChai);
chai.use(checkChai);
global.chai = chai;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.expect = chai.expect;
global.assert = chai.assert;
