const test = require('ava');
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
    .send({ email: 'test2@example.com' })
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

test(`allows password reset for valid email`, async t => {
  await koaRequest(app)
    .post('/en/signup')
    .set('Accept', 'application/json')
    .send({ email: 'test3@example.com' })
    .send({ password: 'password' });

  const htmlRes = await koaRequest(app)
    .post('/en/forgot-password')
    .set('Accept', 'text/html')
    .send({ email: 'test2@example.com' });

  t.is(htmlRes.status, 302);
  t.snapshot(htmlRes.text);

  const jsonRes = await koaRequest(app)
    .post('/en/forgot-password')
    .set('Accept', 'application/json')
    .send({ email: 'test2@example.com' });

  t.is(jsonRes.status, 200);
  t.is(
    jsonRes.body.message,
    'We have sent you an email with a link to reset your password.'
  );
});
