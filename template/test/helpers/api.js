const { promisify } = require('util');

const api = require('../../api');

const beforeEach = t => {
  t.context.api = api.app.listen();
};

const afterEach = t => {
  return promisify(t.context.api.close).bind(t.context.api);
};

module.exports = {
  beforeEach,
  afterEach
};
