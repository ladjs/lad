// Necessary utils for testing
// Librarires required for testing
const MongodbMemoryServer = require('mongodb-memory-server').default;
const mongoose = require('mongoose');
const request = require('supertest');
const { factory, MongooseAdapter } = require('factory-girl');

factory.setAdapter(new MongooseAdapter());

// Models and server
const config = require('../config');
const { Users } = require('../app/models');
const _ = require('lodash');
const { authenticator } = require('otplib');

const mongod = new MongodbMemoryServer();

//
// setup utilities
//
exports.setupMongoose = async () => {
  const uri = await mongod.getConnectionString();
  await mongoose.connect(uri);
};

exports.setupWebServer = async t => {
  process.env.WEB_RATELIMIT_MAX = 250;
  // must require here in order to load changes made during setup
  t.context.web = await request.agent(require('../web').server);
};

exports.setupApiServer = async t => {
  // must require here in order to load changes made during setup
  t.context.api = await request.agent(require('../api').server);
};

// make sure to load the web server first using setupWebServer
exports.loginUser = async t => {
  const { web, user, password } = t.context;

  await web.post('/en/login').send({
    email: user.email,
    password
  });
};
//
// teardown utilities
//
exports.teardownMongoose = async t => {
  mongoose.disconnect();
  mongod.stop();
};

//
// factory definitions
// <https://github.com/simonexmachina/factory-girl>
//
exports.defineUserFactory = async t => {
  factory.define('user', Users, buildOptions => {
    const user = {
      email: factory.sequence('Users.email', n => `test${n}@example.com`),
      password: buildOptions.password
        ? buildOptions.password
        : '!@K#NLK!#N'
    };

    if (buildOptions.resetToken) {
      user[config.userFields.resetToken] = buildOptions.resetToken;
      user[config.userFields.resetTokenExpiresAt] = new Date(Date.now() + 10000);
    }

    return user;
  });
};
