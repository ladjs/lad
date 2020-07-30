const test = require('ava');

const config = require('../../config');
const phrases = require('../../config/phrases');

const utils = require('../utils');

test.before(utils.setupMongoose);
test.after.always(utils.teardownMongoose);
test.beforeEach(utils.setupApiServer);

test('fails when no creds are presented', async (t) => {
  const { api } = t.context;
  const res = await api.get('/v1/account');
  t.is(401, res.status);
});

test("returns current user's account", async (t) => {
  const { api } = t.context;
  const body = {
    email: 'testglobal@api.example.com',
    password: 'FKOZa3kP0TxSCA'
  };

  let res = await api.post('/v1/account').send(body);
  t.is(200, res.status);

  res = await api.get('/v1/account').set({
    Authorization: `Basic ${Buffer.from(
      `${res.body[config.userFields.apiToken]}:`
    ).toString('base64')}`
  });
  t.is(res.body.message, phrases.EMAIL_VERIFICATION_REQUIRED);
  t.is(401, res.status);
});
