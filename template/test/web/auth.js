const util = require('util');
const test = require('ava');

const phrases = require('../../config/phrases');
const { Users } = require('../../app/models');

test('creates new user', async t => {
  const res = await global.web.post('/en/register', {
    body: {
      email: 'test@example.com',
      password: '@!#SAL:DMA:SKLM!@'
    }
  });
  t.is(res.body.redirectTo, '/en/dashboard');
  // Should be 201 for success on create
  t.is(res.status, 200);
});

test('fails registering with easy password', async t => {
  const res = await global.web.post('/en/register', {
    body: {
      email: 'test1@example.com',
      password: 'password'
    }
  });
  t.is(res.body.message, phrases.INVALID_PASSWORD_STRENGTH);
  t.is(res.status, 400);
});

test('fails registering invalid email', async t => {
  const res = await global.web.post('/en/register', {
    body: {
      email: 'test123',
      password: 'testpassword'
    }
  });
  t.is(res.status, 400);
});

test("doesn't leak used email", async t => {
  const email = 'test2@example.com';
  const password = '!@K#NLK!#NSADKMSAD:K';

  await global.web.post('/en/register', {
    body: { email, password }
  });

  const res = await global.web.post('/en/register', {
    body: { email, password: 'wrongpassword' }
  });

  t.is(res.status, 400);
  t.is(res.body.message, phrases.PASSPORT_USER_EXISTS_ERROR);
});

test('allows password reset for valid email (HTML)', async t => {
  const email = 'test3@example.com';
  const password = '!@K#NLK!#N';

  await global.web.post('/en/register', {
    body: { email, password }
  });

  const res = await global.web.post('/en/forgot-password', {
    headers: { Accept: 'text/html' },
    body: { email }
  });

  t.is(res.status, 200);
});

test('allows password reset for valid email (JSON)', async t => {
  const email = 'test4@example.com';
  const password = '!@K#NLK!#N';

  await global.web.post('/en/register', { body: { email, password } });

  const res = await global.web.post('/en/forgot-password', { body: { email } });

  t.is(res.status, 200);
  t.is(res.body.message, phrases.PASSWORD_RESET_SENT);
});

test('resets password with valid email and token (HTML)', async t => {
  const email = 'test5@example.com';
  const password = '!@K#NLK!#N';

  await global.web.post('/en/register', { body: { email, password } });

  await global.web.post('/en/forgot-password', { body: { email } });

  const user = await Users.findOne({ email })
    .select(global.config.userFields.resetToken)
    .exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await global.web.post(
    `/en/reset-password/${user[global.config.userFields.resetToken]}`,
    {
      body: { email, password },
      headers: {
        Accept: 'text/html'
      }
    }
  );

  t.is(res.status, 200);
});

test('resets password with valid email and token (JSON)', async t => {
  const email = 'test6@example.com';
  const password = '!@K#NLK!#N';

  await global.web.post('/en/register', { body: { email, password } });

  await global.web.post('/en/forgot-password', { body: { email } });

  const user = await Users.findOne({ email })
    .select(global.config.userFields.resetToken)
    .exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await global.web.post(
    `/en/reset-password/${user[global.config.userFields.resetToken]}`,
    {
      body: { email, password }
    }
  );

  t.is(res.status, 200);
  t.is(res.body.message, phrases.RESET_PASSWORD);
});

test('fails resetting password for non-existent user', async t => {
  const email = 'test7@example.com';
  const password = '!@K#NLK!#N';

  const res = await global.web.post('/en/reset-password/randomtoken', {
    body: { email, password }
  });

  t.is(res.status, 400);
  t.is(res.body.message, phrases.INVALID_RESET_PASSWORD);
});

test('fails resetting password with invalid reset token', async t => {
  const email = 'test8@example.com';
  const password = '!@K#NLK!#N';

  await global.web.post('/en/register', { body: { email, password } });

  await global.web.post('/en/forgot-password', { body: { email } });

  const res = await global.web.post('/en/reset-password/wrongtoken', {
    body: { email, password }
  });

  t.is(res.status, 400);
  t.is(res.body.message, phrases.INVALID_RESET_PASSWORD);
});

test('fails resetting password with missing new password', async t => {
  const email = 'test9@example.com';
  const password = '!@K#NLK!#N';

  await global.web.post('/en/register', { body: { email, password } });

  await global.web.post('/en/forgot-password', { body: { email } });

  const user = await Users.findOne({ email })
    .select(global.config.userFields.resetToken)
    .exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await global.web.post(
    `/en/reset-password/${user[global.config.userFields.resetToken]}`,
    {
      body: { email }
    }
  );

  t.is(res.status, 400);
  t.is(res.body.message, phrases.INVALID_PASSWORD);
});

test('fails resetting password with invalid email', async t => {
  const email = 'test10@example.com';
  const password = '!@K#NLK!#N';

  await global.web.post('/en/register', { body: { email, password } });

  await global.web.post('/en/forgot-password', { body: { email } });

  const user = await Users.findOne({ email })
    .select(global.config.userFields.resetToken)
    .exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await global.web.post(
    `/en/reset-password/${user[global.config.userFields.resetToken]}`,
    {
      body: { email: 'wrongemail' }
    }
  );

  t.is(res.status, 400);
  t.is(res.body.message, phrases.INVALID_EMAIL);
});

test('fails resetting password with invalid email + reset token match', async t => {
  const email = 'test11@example.com';
  const password = '!@K#NLK!#N';

  await global.web.post('/en/register', { body: { email, password } });

  await global.web.post('/en/forgot-password', { body: { email } });

  const user = await Users.findOne({ email }).exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await global.web.post(
    `/en/reset-password/${user[global.config.userFields.resetToken]}`,
    {
      body: { email: 'wrongemail@example.com', password }
    }
  );

  t.is(res.status, 400);
  t.is(res.body.message, phrases.INVALID_RESET_PASSWORD);
});

test('fails resetting password if new password is too weak', async t => {
  const email = 'test12@example.com';
  const password = '!@K#NLK!#N';

  await global.web.post('/en/register', { body: { email, password } });

  await global.web.post('/en/forgot-password', { body: { email } });

  const user = await Users.findOne({ email })
    .select(global.config.userFields.resetToken)
    .exec();

  if (!user) {
    throw new Error('User does not exist');
  }

  const res = await global.web.post(
    `/en/reset-password/${user[global.config.userFields.resetToken]}`,
    {
      body: { email, password: 'password' }
    }
  );

  t.is(res.status, 400);
  t.is(res.body.message, phrases.INVALID_PASSWORD_STRENGTH);
});

test('fails resetting password if reset was already tried in the last 30 mins', async t => {
  const email = 'test13@example.com';
  const password = '!@K#NLK!#N';

  await global.web.post('/en/register', { body: { email, password } });

  await global.web.post('/en/forgot-password', { body: { email } });

  const res = await global.web.post('/en/forgot-password', { body: { email } });

  t.is(res.status, 400);
  t.is(
    res.body.message,
    util.format(phrases.PASSWORD_RESET_LIMIT, 'in 30 minutes')
  );
});
