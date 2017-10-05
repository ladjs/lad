const test = require('ava');
const { Users } = require('../../app/models');
const app = require('../../web');
const {
  before,
  beforeEach,
  afterEach,
  after,
  koaRequest
} = require('../helpers');

test.before(before);
test.beforeEach(beforeEach);
test.afterEach(afterEach);
test.after.always(after);

test('creates new user', async t => {
  const res = await koaRequest(app)
    .post('/en/signup')
    .set('Accept', 'application/json')
    .send({ email: 'test@example.com' })
    .send({ password: '@!#SAL:DMA:SKLM!@' });

  t.is(res.body.message, `You have successfully registered`);
  // Should be 201 for success on create
  t.is(res.status, 200);
});

test(`fails registering with easy password`, async t => {
  const res = await koaRequest(app)
    .post('/en/signup')
    .set('Accept', 'application/json')
    .send({ email: 'test1@example.com' })
    .send({ password: 'password' });

  t.is(res.body.message, `Password not strong enough`);
  t.is(res.status, 400);
});

test('fails registering invalid email', async t => {
  const res = await koaRequest(app)
    .post('/en/signup')
    .set('Accept', 'application/json')
    .send({ email: 'test123' })
    .send({ password: 'testpassword' });

  t.is(res.status, 400);
});

test(`doesn't leak used email`, async t => {
  const email = 'test2@example.com';
  const password = '!@K#NLK!#N';

  await koaRequest(app)
    .post('/en/signup')
    .set('Accept', 'application/json')
    .send({ email })
    .send({ password });

  const res = await koaRequest(app)
    .post('/en/signup')
    .set('Accept', 'application/json')
    .send({ email })
    .send({ password: 'wrongpassword' });

  t.is(res.status, 400);
  t.is(
    res.body.message,
    'A user with the given username is already registered'
  );
});

test(`allows password reset for valid email (HTML)`, async t => {
  const email = 'test3@example.com';
  const password = '!@K#NLK!#N';

  await koaRequest(app)
    .post('/en/signup')
    .set('Accept', 'application/json')
    .send({ email })
    .send({ password });

  const res = await koaRequest(app)
    .post('/en/forgot-password')
    .set('Accept', 'text/html')
    .send({ email });

  t.is(res.status, 302);
  t.snapshot(res.text);
});

test(`allows password reset for valid email (JSON)`, async t => {
  const email = 'test4@example.com';
  const password = '!@K#NLK!#N';

  await koaRequest(app)
    .post('/en/signup')
    .set('Accept', 'application/json')
    .send({ email })
    .send({ password });

  const res = await koaRequest(app)
    .post('/en/forgot-password')
    .set('Accept', 'application/json')
    .send({ email });

  t.is(res.status, 200);
  t.is(
    res.body.message,
    'We have sent you an email with a link to reset your password.'
  );
});

test(`resets password with valid email and token (HTML)`, async t => {
  const email = 'test5@example.com';
  const password = '!@K#NLK!#N';

  await koaRequest(app)
    .post('/en/signup')
    .set('Accept', 'application/json')
    .send({ email })
    .send({ password });

  await koaRequest(app)
    .post('/en/forgot-password')
    .set('Accept', 'application/json')
    .send({ email });

  const user = await Users.findOne({ email })
    .select('reset_token')
    .exec();

  const res = await koaRequest(app)
    .post(`/en/reset-password/${user.reset_token}`)
    .set('Accept', 'text/html')
    .send({ email })
    .send({ password });

  t.is(res.status, 302);
  t.snapshot(res.text);
});

test(`resets password with valid email and token (JSON)`, async t => {
  const email = 'test6@example.com';
  const password = '!@K#NLK!#N';

  await koaRequest(app)
    .post('/en/signup')
    .set('Accept', 'application/json')
    .send({ email })
    .send({ password });

  await koaRequest(app)
    .post('/en/forgot-password')
    .set('Accept', 'application/json')
    .send({ email });

  const user = await Users.findOne({ email })
    .select('reset_token')
    .exec();

  const res = await koaRequest(app)
    .post(`/en/reset-password/${user.reset_token}`)
    .set('Accept', 'application/json')
    .send({ email })
    .send({ password });

  t.is(res.status, 200);
  t.is(res.body.message, 'You have successfully reset your password.');
});

test(`fails resetting password for non-existant user`, async t => {
  const email = 'test7@example.com';
  const password = '!@K#NLK!#N';

  const res = await koaRequest(app)
    .post(`/en/reset-password/randomtoken`)
    .set('Accept', 'application/json')
    .send({ email })
    .send({ password });

  t.is(res.status, 400);
  t.is(res.body.message, 'Reset token and email were not valid together.');
});

test(`fails resetting password with invalid token`, async t => {
  const email = 'test8@example.com';
  const password = '!@K#NLK!#N';

  await koaRequest(app)
    .post('/en/signup')
    .set('Accept', 'application/json')
    .send({ email })
    .send({ password });

  await koaRequest(app)
    .post('/en/forgot-password')
    .set('Accept', 'application/json')
    .send({ email });

  const res = await koaRequest(app)
    .post(`/en/reset-password/wrongtoken`)
    .set('Accept', 'application/json')
    .send({ email })
    .send({ password });

  t.is(res.status, 400);
  t.is(res.body.message, 'Reset token and email were not valid together.');
});

// @TODO: Add test for each provider
