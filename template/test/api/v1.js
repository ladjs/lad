const test = require('ava');

const phrases = require('../../config/phrases');

const { before, beforeEach, afterEach, after } = require('../_utils');

test.before(before);
test.after.always(after);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);

test('fails when no creds are presented', async t => {
  const { api } = t.context;
  const res = await api.get('/v1/account');
  t.is(401, res.status);
});

test("returns current user's account", async t => {
  const { api } = t.context;
  const body = {
    email: 'testglobal@api.example.com',
    password: 'FKOZa3kP0TxSCA'
  };

  let res = await api.post('/v1/account').send(body);
  t.is(200, res.status);

  res = await api.get('/v1/account').set({
      Authorization: `Basic ${Buffer.from(
        `${res.body[global.config.userFields.apiToken]}:`
      ).toString('base64')}`
    });
  t.is(res.body.message, phrases.EMAIL_VERIFICATION_REQUIRED);
  t.is(401, res.status);
});
