const test = require('ava');

const phrases = require('../../config/phrases');

test('fails when no creds are presented', async t => {
  const res = await global.api.get('/v1/account');
  t.is(401, res.status);
});

test("returns current user's account", async t => {
  const body = {
    email: 'testglobal@api.example.com',
    password: 'FKOZa3kP0TxSCA'
  };

  let res = await global.api.post('/v1/account', { body });
  t.is(200, res.status);

  res = await global.api.get('/v1/account', {
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${res.body[global.config.userFields.apiToken]}:`
      ).toString('base64')}`
    }
  });
  t.is(res.body.message, phrases.EMAIL_VERIFICATION_REQUIRED);
  t.is(401, res.status);
});
