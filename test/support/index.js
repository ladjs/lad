
Error.stackTraceLimit = Infinity;

// babel requirements
import 'babel-polyfill';
import 'source-map-support/register';

import path from 'path';

// ensure we have all necessary env variables
import dotenvSafe from 'dotenv-safe';
dotenvSafe.load();

import 'isomorphic-fetch';

import Frisbee from 'frisbee';
global.Frisbee = Frisbee;

import FormData from 'form-data';
global.FormData = FormData;

import config from '../../src/config';
global.config = config;

// fixtures directory
global.fixturesDir = path.join(__dirname, '..', 'fixtures');

// base URI for everything
global._options = {
  baseURI: 'http://localhost:8080',
  headers: {
    Accept: 'application/json',
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
