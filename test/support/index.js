
import path from 'path';
import 'isomorphic-fetch';
import Frisbee from 'frisbee';
import FormData from 'form-data';
import chai from 'chai';
import dirtyChai from 'dirty-chai';
import checkChai from 'check-chai';

import config from '../../lib/config';

chai.config.includeStack = true;
chai.config.showDiff = true;
chai.use(dirtyChai);
chai.use(checkChai);

global.Frisbee = Frisbee;
global.FormData = FormData;
global.config = config;
global.fixturesDir = path.join(__dirname, '..', 'fixtures');
global._options = {
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json'
  }
};
global.chai = chai;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.expect = chai.expect;
global.assert = chai.assert;
