const test = require('ava');

test('creates new user', async t => {
  const res = await global.webRequest.post('/en/register', {
    body: {
      email: 'test@example.com',
      password: '@!#SAL:DMA:SKLM!@'
    }
  });
  t.is(res.body.redirectTo, '/en/dashboard');
  // Should be 201 for success on create
  t.is(res.status, 200);
});

test(`fails registering with easy password`, async t => {
  const res = await global.webRequest.post('/en/register', {
    body: {
      email: 'test1@example.com',
      password: 'password'
    }
  });
  t.is(res.body.message, `Password not strong enough`);
  t.is(res.status, 400);
});

test('fails registering invalid email', async t => {
  const res = await global.webRequest.post('/en/register', {
    body: {
      email: 'test123',
      password: 'testpassword'
    }
  });
  t.is(res.status, 400);
});

test(`doesn't leak used email`, async t => {
  const email = 'test2@example.com';
  const password = '!@K#NLK!#NSADKMSAD:K';

  await global.webRequest.post('/en/register', {
    body: { email, password }
  });

  const res = await global.webRequest.post('/en/register', {
    body: { email, password: 'wrongpassword' }
  });

  t.is(res.status, 400);
  t.is(res.body.message, 'A user with the given username is already registered');
});

test(`allows password reset for valid email (HTML)`, async t => {
  const email = 'test3@example.com';
  const password = '!@K#NLK!#N';

  await global.webRequest.post('/en/register', {
    body: { email, password }
  });

  const res = await global.webRequest.post('/en/forgot-password', {
    headers: { Accept: 'text/html' },
    body: { email }
  });

  t.is(res.status, 200);
});

test(`allows password reset for valid email (JSON)`, async t => {
  const email = 'test4@example.com';
  const password = '!@K#NLK!#N';

  await global.webRequest.post('/en/register', { body: { email, password } });

  const res = await global.webRequest.post('/en/forgot-password', { body: { email } });

  t.is(res.status, 200);
  t.is(res.body.message, 'We have sent you an email with a link to reset your password.');
});

test(`resets password with valid email and token (HTML)`, async t => {
  const email = 'test5@example.com';
  const password = '!@K#NLK!#N';

  await global.webRequest.post('/en/register', { body: { email, password } });

  await global.webRequest.post('/en/forgot-password', { body: { email } });

  const user = await global.Users.findOne({ email })
    .select('reset_token')
    .exec();

  if (!user) throw new Error('User does not exist');

  const res = await global.webRequest.post(`/en/reset-password/${user.reset_token}`, {
    body: { email, password },
    headers: {
      Accept: 'text/html'
    }
  });

  t.is(res.status, 200);
});

test(`resets password with valid email and token (JSON)`, async t => {
  const email = 'test6@example.com';
  const password = '!@K#NLK!#N';

  await global.webRequest.post('/en/register', { body: { email, password } });

  await global.webRequest.post('/en/forgot-password', { body: { email } });

  const user = await global.Users.findOne({ email })
    .select('reset_token')
    .exec();

  if (!user) throw new Error('User does not exist');

  const res = await global.webRequest.post(`/en/reset-password/${user.reset_token}`, {
    body: { email, password }
  });

  t.is(res.status, 200);
  t.is(res.body.message, 'You have successfully reset your password.');
});

test(`fails resetting password for non-existent user`, async t => {
  const email = 'test7@example.com';
  const password = '!@K#NLK!#N';

  const res = await global.webRequest.post(`/en/reset-password/randomtoken`, {
    body: { email, password }
  });

  t.is(res.status, 400);
  t.is(res.body.message, 'Reset token and email were not valid together.');
});

test(`fails resetting password with invalid reset_token`, async t => {
  const email = 'test8@example.com';
  const password = '!@K#NLK!#N';

  await global.webRequest.post('/en/register', { body: { email, password } });

  await global.webRequest.post('/en/forgot-password', { body: { email } });

  const res = await global.webRequest.post(`/en/reset-password/wrongtoken`, {
    body: { email, password }
  });

  t.is(res.status, 400);
  t.is(res.body.message, 'Reset token and email were not valid together.');
});

test(`fails resetting password with missing new password`, async t => {
  const email = 'test9@example.com';
  const password = '!@K#NLK!#N';

  await global.webRequest.post('/en/register', { body: { email, password } });

  await global.webRequest.post('/en/forgot-password', { body: { email } });

  const user = await global.Users.findOne({ email })
    .select('reset_token')
    .exec();

  if (!user) throw new Error('User does not exist');

  const res = await global.webRequest.post(`/en/reset-password/${user.reset_token}`, {
    body: { email }
  });

  t.is(res.status, 400);
  t.is(res.body.message, 'Password was invalid.');
});

test(`fails resetting password with invalid email`, async t => {
  const email = 'test10@example.com';
  const password = '!@K#NLK!#N';

  await global.webRequest.post('/en/register', { body: { email, password } });

  await global.webRequest.post('/en/forgot-password', { body: { email } });

  const user = await global.Users.findOne({ email })
    .select('reset_token')
    .exec();

  if (!user) throw new Error('User does not exist');

  const res = await global.webRequest.post(`/en/reset-password/${user.reset_token}`, {
    body: { email: 'wrongemail' }
  });

  t.is(res.status, 400);
  t.is(res.body.message, 'Email address was invalid.');
});

test(`fails resetting password with invalid email + reset_token match`, async t => {
  const email = 'test11@example.com';
  const password = '!@K#NLK!#N';

  await global.webRequest.post('/en/register', { body: { email, password } });

  await global.webRequest.post('/en/forgot-password', { body: { email } });

  const user = await global.Users.findOne({ email }).exec();

  if (!user) throw new Error('User does not exist');

  const res = await global.webRequest.post(`/en/reset-password/${user.reset_token}`, {
    body: { email: 'wrongemail@example.com', password }
  });

  t.is(res.status, 400);
  t.is(res.body.message, 'Reset token and email were not valid together.');
});

test(`fails resetting password if new password is too weak`, async t => {
  const email = 'test12@example.com';
  const password = '!@K#NLK!#N';

  await global.webRequest.post('/en/register', { body: { email, password } });

  await global.webRequest.post('/en/forgot-password', { body: { email } });

  const user = await global.Users.findOne({ email })
    .select('reset_token')
    .exec();

  if (!user) throw new Error('User does not exist');

  const res = await global.webRequest.post(`/en/reset-password/${user.reset_token}`, {
    body: { email, password: 'password' }
  });

  t.is(res.status, 400);
  t.is(res.body.message, 'Password strength was not strong enough.');
});

test(`fails resetting password if reset was already tried in the last 30 mins`, async t => {
  const email = 'test13@example.com';
  const password = '!@K#NLK!#N';

  await global.webRequest.post('/en/register', { body: { email, password } });

  await global.webRequest.post('/en/forgot-password', { body: { email } });

  const res = await global.webRequest.post('/en/forgot-password', { body: { email } });

  t.is(res.status, 400);
  t.is(
    res.body.message,
    'You can only request a password reset every 30 minutes.  Please try again in 30 minutes.'
  );
});
