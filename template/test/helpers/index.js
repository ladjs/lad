const mongoose = require('mongoose');
const koaRequest = require('./koa-request');

const before = () => {};
const beforeEach = () => {};
const afterEach = () => {};
const after = () => mongoose.connection.db.dropDatabase();

module.exports = {
  before,
  beforeEach,
  afterEach,
  after,
  koaRequest
};
