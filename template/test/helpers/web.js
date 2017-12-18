const { promisify } = require('util');

const web = require('../../web');

const beforeEach = t => {
  t.context.web = web.app.listen();
};

const afterEach = t => {
  return promisify(t.context.web.close).bind(t.context.web);
};

module.exports = {
  beforeEach,
  afterEach
};
