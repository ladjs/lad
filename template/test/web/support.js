const test = require('ava');
const request = require('supertest');

const mongoose = require('../helpers/mongoose');
const web = require('../helpers/web');

test.before(mongoose.before);
test.beforeEach(web.beforeEach);
test.afterEach(web.afterEach);
test.after.always(mongoose.after);

test('creates inquiry', async t => {
  const res = await request(t.context.web)
    .post('/en/support')
    .set('Accept', 'application/json')
    .send({ email: 'test@example.com' })
    .send({ message: 'Test message!' });

  t.is(res.status, 200);
  t.is(
    res.body.message,
    'Your support request has been sent successfully.  You should hear from us soon.  Thank you!'
  );
});

test('fails creating inquiry if last inquiry was within last 24 hours (HTML)', async t => {
  await request(t.context.web)
    .post('/en/support')
    .set('Accept', 'application/json')
    .send({ email: 'test2@example.com' })
    .send({ message: 'Test message!' });

  const res = await request(t.context.web)
    .post('/en/support')
    .set('Accept', 'text/html')
    .send({ email: 'test2@example.com' })
    .send({ message: 'Test message!' });

  t.is(res.status, 400);
  t.snapshot(res.text);
});

test('fails creating inquiry if last inquiry was within last 24 hours (JSON)', async t => {
  await request(t.context.web)
    .post('/en/support')
    .set('Accept', 'application/json')
    .send({ email: 'test3@example.com' })
    .send({ message: 'Test message!' });

  const res = await request(t.context.web)
    .post('/en/support')
    .set('Accept', 'application/json')
    .send({ email: 'test3@example.com' })
    .send({ message: 'Test message!' });

  t.is(res.status, 400);
  t.is(
    res.body.message,
    'You have reached the limit for sending support requests.  Please try again.'
  );
});
