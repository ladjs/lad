// Necessary utils for testing
// Librarires required for testing
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const request = require('supertest');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { factory, MongooseAdapter } = require('factory-girl');

// Models and server
const config = require('../config');
const { Users } = require('../app/models');

let mongod;
const adapter = new MongooseAdapter();

// create connection to mongoose before all tests
exports.before = async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri);

  factory.setAdapter(adapter);
  factory.define('user', Users, {
    email: factory.sequence('Users.email', (n) => `test${n}@example.com`),
    password: '!@K#NLK!#N'
  });
};

// create fixtures before each test
exports.beforeEach = async (t) => {
  // setup stubs for serializeUser and deserializeUser
  t.context.serialize = sinon.stub().returns(() => {});
  t.context.deserialize = sinon.stub().returns(() => {});
  proxyquire('../helpers/passport', {
    '../config': {
      passport: {
        ...config.passport,
        serializeUser: t.context.serialize,
        deserializeUser: t.context.deserialize
      }
    }
  });

  t.context.web = await request.agent(require('../web').server);
  t.context.api = await request.agent(require('../api').server);
};

exports.afterEach = async () => {
  sinon.restore();
};

exports.after = async () => {
  mongoose.disconnect();
  mongod.stop();

  factory.cleanUp();
};
