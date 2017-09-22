const test = require('ava');
const app = require('../../api');
const { koaRequest } = require('../helpers');

test('returns 404', async t => {
  const res = await koaRequest(app).get('/');

  t.is(404, res.status);
});
