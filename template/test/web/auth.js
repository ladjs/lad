// Libraries required for testing
const util = require('util');
const test = require('ava');
const cryptoRandomString = require('crypto-random-string');

const phrases = require('../../config/phrases');
const config = require('../../config');
const { Users } = require('../../app/models');

const { before, beforeEach, afterEach, after, login } = require('../_utils');

test.before(before);
test.after.always(after);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);

test.serial('creates new user', async t => {
  const { web } = t.context;
  const res = await web.post('/en/register').send({
    email: 'lordbyron@example.com',
    password: '?X#8Hn=PbkvTD/{'
  });

  t.is(res.header.location, '/en/dashboard');
  t.is(res.status, 302);

  // make sure user was added to database
  const newUser = await Users.findOne({ email: 'lordbyron@example.com' });
  t.is(newUser.email, 'lordbyron@example.com');
});

test('fails registering with easy password', async t => {
  const { web } = t.context;
  const res = await web.post('/en/register').send({
    email: 'emilydickinson@example.com',
    password: 'password'
  });

  t.is(res.body.message, phrases.INVALID_PASSWORD_STRENGHT);
  t.is(res.status, 400);

  // make sure user was not added to database
  const newUser = await Users.findOne({ email: 'emilydickinson@example.com' });
  t.is(newUser, null);
});

test('successfully registers with strong password', async t => {
  const { web } = t.context;
  const res = await web.post('/en/register').send({
    email: 'test12@example.com',
    password: 'Thi$i$@$r0ng3rP@$$W0rdMyDude'
  });

  t.is(res.body.message, undefined);
  t.is(res.header.location, '/en/dashboard');
  t.is(res.status, 302);

  const newUser = await Users.findOne({ email: 'test12@example.com' });
  t.is(newUser.email, 'test12@example.com');
});

test('successfully registers with stronger password', async t => {
  const { web } = t.context;
  const res = await web.post('/en/register').send({
    email: 'test123@example.com',
    password: cryptoRandomString({ length: 50 })
  });

  t.is(res.body.message, undefined);
  t.is(res.header.location, '/en/dashboard');
  t.is(res.status, 302);

  const newUser = await Users.findOne({ email: 'test123@example.com' });
  t.is(newUser.email, 'test123@example.com');
});

test('fails registering invalid email', async t => {
  const { web } = t.context;
  const res = await web.post('/en/register').send({
    email: 'test123',
    password: 'testpassword'
  });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_EMAIL);
});

test("doesn't leak used email", async t => {
  const { web } = t.context;
  const email = 'test2@example.com';
  const password = '!@K#NLK!#NSADKMSAD:K';

  await web.post('/en/register').send({ email, password });
  await web.get('/en/logout');

  const res = await web.post('/en/register')
    .send({
      email,
      password: 'wrongpassword'
    });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.PASSPORT_USER_EXISTS_ERROR);
});

test('allows password reset for valid email (HTML)', async t => {
  const { web } = t.context;
  const email = 'test3@example.com';
  const password = '!@K#NLK!#N';

  await web.post('/en/register').send({ email, password });

  const res = await web
    .post('/en/forgot-password')
    .set({ Accept: 'text/html' })
    .send({ email });

  t.is(res.status, 302);
  t.is(res.header.location, '/');
});

test('allows password reset for valid email (JSON)', async t => {
  const { web } = t.context;
  const email = 'test4@example.com';
  const password = '!@K#NLK!#N';

  await web.post('/en/register').send({ email, password });

  const res = await web.post('/en/forgot-password').send({ email });

  t.is(res.status, 302);
  t.is(res.header.location, '/');
});

test('resets password with valid email and token (HTML)', async t => {
  const { web } = t.context;
  const email = 'test5@example.com';
  const password = '!@K#NLK!#N';

  await web.post('/en/register').send({ email, password });

  await web.post('/en/forgot-password').send({ email });

  const user = await Users.findOne({ email })
    .select(config.userFields.resetToken)
    .exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await web
    .post(`/en/reset-password/${user[global.config.userFields.resetToken]}`)
    .set({ Accept: 'text/html' })
    .send({ email, password });

  t.is(res.status, 302);
  t.is(res.header.location, '/en');
});

test('resets password with valid email and token (JSON)', async t => {
  const { web } = t.context;
  const email = 'test6@example.com';
  const password = '!@K#NLK!#N';

  await web.post('/en/register').send({ email, password });

  await web.post('/en/forgot-password').send({ email });

  const user = await Users.findOne({ email })
    .select(global.config.userFields.resetToken)
    .exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await web
    .post(`/en/reset-password/${user[global.config.userFields.resetToken]}`)
    .send({ email, password });

  t.is(res.status, 302);
  t.is(res.header.location, '/en');
});

test('fails resetting password for non-existent user', async t => {
  const { web } = t.context;
  const email = 'test7@example.com';
  const password = '!@K#NLK!#N';

  const res = await web
    .post('/en/reset-password/randomtoken')
    .send({ email, password });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_RESET_PASSWORD);
});

test('fails resetting password with invalid reset token', async t => {
  const { web } = t.context;
  const email = 'test8@example.com';
  const password = '!@K#NLK!#N';

  await web.post('/en/register').send({ email, password });

  await web.post('/en/forgot-password').send({ email });

  const res = await web
    .post('/en/reset-password/wrongtoken')
    .send({ email, password });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_RESET_PASSWORD);
});

test('fails resetting password with missing new password', async t => {
  const { web } = t.context;
  const email = 'test9@example.com';
  const password = '!@K#NLK!#N';

  await web.post('/en/register').send({ email, password });

  await web.post('/en/forgot-password').send({ email });

  const user = await Users.findOne({ email })
    .select(global.config.userFields.resetToken)
    .exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await web
    .post(`/en/reset-password/${user[global.config.userFields.resetToken]}`)
    .send({ email });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_PASSWORD);
});

test('fails resetting password with invalid email', async t => {
  const { web } = t.context;
  const email = 'test10@example.com';
  const password = '!@K#NLK!#N';

  await web.post('/en/register').send({ email, password });

  await web.post('/en/forgot-password').send({ email });

  const user = await Users.findOne({ email })
    .select(global.config.userFields.resetToken)
    .exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await web
    .post(`/en/reset-password/${user[global.config.userFields.resetToken]}`)
    .send({ email: 'wrongemail' });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_EMAIL);
});

test('fails resetting password with invalid email + reset token match', async t => {
  const { web } = t.context;
  const email = 'test11@example.com';
  const password = '!@K#NLK!#N';

  await web.post('/en/register').send({ email, password });

  await web.post('/en/forgot-password').send({ email });

  const user = await Users.findOne({ email }).exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await web
    .post(`/en/reset-password/${user[global.config.userFields.resetToken]}`)
    .send({ email: 'wrongemail@example.com', password });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_RESET_PASSWORD);
});

test('fails resetting password if new password is too weak', async t => {
  const { web } = t.context;
  const email = 'test12@example.com';
  const password = '!@K#NLK!#N';

  await web.post('/en/register').send({ email, password });

  await web.post('/en/forgot-password').send({ email });

  const user = await Users.findOne({ email })
    .select(global.config.userFields.resetToken)
    .exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await web
    .post(`/en/reset-password/${user[global.config.userFields.resetToken]}`)
    .send({ email, password: 'password' });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_PASSWORD_STRENGTH);
});

test('fails resetting password if reset was already tried in the last 30 mins', async t => {
  const { web } = t.context;
  const email = 'test13@example.com';
  const password = '!@K#NLK!#N';

  await web.post('/en/register').send({ email, password });

  await web.post('/en/forgot-password').send({ email });

  const res = await web.post('/en/forgot-password').send({ email });

  t.is(res.status, 400);
  t.is(
    JSON.parse(res.text).message,
    util.format(phrases.PASSWORD_RESET_LIMIT, 'in 30 minutes')
  );
});

test('successfully logout', async t => {
  const web = await login(t.context.web);
  const res = await web.get('/en/logout');

  t.is(res.header.location, '/en');
  t.is(res.status, 302);
});
