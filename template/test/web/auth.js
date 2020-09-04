// Libraries required for testing
const util = require('util');
const test = require('ava');
const cryptoRandomString = require('crypto-random-string');
const { factory } = require('factory-girl');

const phrases = require('../../config/phrases');

const utils = require('../utils');

test.before(utils.setupMongoose);
test.before(utils.defineUserFactory);
test.after.always(utils.teardownMongoose);
test.beforeEach(utils.setupWebServer);

test('creates new user', async (t) => {
  const { web } = t.context;
  const user = await factory.build('user');

  const res = await web.post('/en/register').send({
    email: user.email,
    password: '!@K#NLK!#N'
  });

  t.is(res.status, 302);
  t.is(res.header.location, '/en/my-account');
});

test('fails registering with easy password', async (t) => {
  const { web } = t.context;

  const res = await web.post('/en/register').send({
    email: 'emilydickinson@example.com',
    password: 'password'
  });

  t.is(res.status, 400);
  t.is(res.body.message, phrases.INVALID_PASSWORD_STRENGHT);
});

test('successfully registers with strong password', async (t) => {
  const { web } = t.context;
  const user = await factory.build('user');

  const res = await web.post('/en/register').send({
    email: user.email,
    password: 'Thi$i$@$r0ng3rP@$$W0rdMyDude'
  });

  t.is(res.body.message, undefined);
  t.is(res.header.location, '/en/my-account');
  t.is(res.status, 302);
});

test('successfully registers with stronger password', async (t) => {
  const { web } = t.context;

  const password = await cryptoRandomString.async({ length: 50 });
  const res = await web.post('/en/register').send({
    email: 'test123@example.com',
    password
  });

  t.is(res.body.message, undefined);
  t.is(res.header.location, '/en/my-account');
  t.is(res.status, 302);
});

test('fails registering invalid email', async (t) => {
  const { web } = t.context;

  const res = await web.post('/en/register').send({
    email: 'test123',
    password: 'testpassword'
  });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_EMAIL);
});

test("doesn't leak used email", async (t) => {
  const { web } = t.context;
  const user = await factory.create('user');

  const res = await web.post('/en/register').send({
    email: user.email,
    password: 'wrongpassword'
  });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.PASSPORT_USER_EXISTS_ERROR);
});

test('allows password reset for valid email (HTML)', async (t) => {
  const { web } = t.context;

  const user = await factory.create('user');

  const res = await web
    .post('/en/forgot-password')
    .set({ Accept: 'text/html' })
    .send({ email: user.email });

  t.is(res.status, 302);
  t.is(res.header.location, '/');
});

test('allows password reset for valid email (JSON)', async (t) => {
  const { web } = t.context;

  const user = await factory.create('user');

  const res = await web.post('/en/forgot-password').send({ email: user.email });

  t.is(res.status, 302);
  t.is(res.header.location, '/');
});

test('resets password with valid email and token (HTML)', async (t) => {
  const { web } = t.context;
  const user = await factory.create('user', {}, { resetToken: 'token' });
  const { email } = user;
  const password = '!@K#NLK!#N';

  const res = await web
    .post(`/en/reset-password/token`)
    .set({ Accept: 'text/html' })
    .send({ email, password });

  t.is(res.status, 302);
  t.is(res.header.location, '/en');
});

test('resets password with valid email and token (JSON)', async (t) => {
  const { web } = t.context;
  const user = await factory.create('user', {}, { resetToken: 'token' });
  const { email } = user;
  const password = '!@K#NLK!#N';

  const res = await web
    .post(`/en/reset-password/token`)
    .send({ email, password });

  t.is(res.status, 302);
  t.is(res.header.location, '/en');
});

test('fails resetting password for non-existent user', async (t) => {
  const { web } = t.context;
  const email = 'test7@example.com';
  const password = '!@K#NLK!#N';

  const res = await web
    .post('/en/reset-password/randomtoken')
    .send({ email, password });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_RESET_PASSWORD);
});

test('fails resetting password with invalid reset token', async (t) => {
  const { web } = t.context;
  const user = await factory.create('user', {}, { resetToken: 'token' });
  const { email } = user;
  const password = '!@K#NLK!#N';

  const res = await web
    .post('/en/reset-password/wrongtoken')
    .send({ email, password });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_RESET_PASSWORD);
});

test('fails resetting password with missing new password', async (t) => {
  const { web } = t.context;
  const user = await factory.create('user', {}, { resetToken: 'token' });
  const { email } = user;

  const res = await web.post(`/en/reset-password/token`).send({ email });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_PASSWORD);
});

test('fails resetting password with invalid email', async (t) => {
  const { web } = t.context;
  await factory.create('user', {}, { resetToken: 'token' });

  const res = await web
    .post(`/en/reset-password/token`)
    .send({ email: 'wrongemail' });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_EMAIL);
});

test('fails resetting password with invalid email + reset token match', async (t) => {
  const { web } = t.context;
  await factory.create('user', {}, { resetToken: 'token' });
  const password = '!@K#NLK!#N';

  const res = await web
    .post(`/en/reset-password/token`)
    .send({ email: 'wrongemail@example.com', password });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_RESET_PASSWORD);
});

test('fails resetting password if new password is too weak', async (t) => {
  const { web } = t.context;
  const user = await factory.create('user', {}, { resetToken: 'token' });
  const { email } = user;

  const res = await web
    .post(`/en/reset-password/token`)
    .send({ email, password: 'password' });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_PASSWORD_STRENGTH);
});

test('fails resetting password if reset was already tried in the last 30 mins', async (t) => {
  const { web } = t.context;
  const user = await factory.create('user');
  const { email } = user;

  await web.post('/en/forgot-password').send({ email });

  const res = await web.post('/en/forgot-password').send({ email });

  t.is(res.status, 400);
  t.is(
    JSON.parse(res.text).message,
    util.format(phrases.PASSWORD_RESET_LIMIT, 'in 30 minutes')
  );
});
