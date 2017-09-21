const test = require('ava');
const app = require('../api');
const { koaRequest } = require('./helpers');

test('returns 200', async t => {
  const res = await koaRequest(app).get('/');

  t.is(200, res.status);
});
