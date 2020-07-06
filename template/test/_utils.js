// Necessary utils for testing
// Librarires required for testing
const MongodbMemoryServer = require('mongodb-memory-server').default;
const mongoose = require('mongoose');
const request = require('supertest');
const sinon = require('sinon');
const { factory } = require('factory-girl');

// Models and server
const config = require('../config');
const api = require('../api');
const { Users } = require('../app/models');
const web = require('../web');

const mongod = new MongodbMemoryServer();

// create connection to mongoose before all tests
exports.before = async () => {
  const uri = await mongod.getConnectionString();
  await mongoose.connect(uri);
  factory.define('user', Users, {
    email: factory.sequence('Users.email', n => `test${n}@example.com`),
    password: '!@K#NLK!#N'
  });
};

// create fixtures before each test
exports.beforeEach = async t => {
  t.context.serialize = config.passport.serializeUser;
  t.context.deserialize = config.passport.deserializeUser;

  t.context.web = await request.agent(web.server);
  t.context.api = await request.agent(api.server);
};

exports.afterEach = async () => {
};

exports.after = async () => {
  mongoose.disconnect();
  mongod.stop();
  factory.cleanUp();
};
