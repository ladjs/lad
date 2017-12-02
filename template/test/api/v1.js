const test = require('ava');
const request = require('supertest');

const mongoose = require('../helpers/mongoose');
const api = require('../helpers/api');

test.before(mongoose.before);
test.beforeEach(api.beforeEach);
test.afterEach(api.afterEach);
test.after.always(mongoose.after);

test(`fails when no creds are presented`, async t => {
  const res = await request(t.context.api)
    .get('/v1/account')
    .set('Accept', 'application/json');
  t.is(401, res.status);
});

test(`returns current user's account`, async t => {
  const user = { email: 'testapi@example.com', password: 'FKOZa3kP0TxSCA' };

  let res = await request(t.context.api)
    .post('/v1/account')
    .set('Accept', 'application/json')
    .send(user);
  t.is(200, res.status);

  res = await request(t.context.api)
    .get('/v1/account')
    .set('Accept', 'application/json')
    .auth(res.body.api_token);
  t.is(200, res.status);
});
