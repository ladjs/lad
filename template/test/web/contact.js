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

test('creates inquiry', async t => {
  const res = await koaRequest(app)
    .post('/en/contact')
    .set('Accept', 'application/json')
    .send({ email: 'test@example.com' })
    .send({ message: 'Test message!' });

  t.is(res.status, 200);
  t.is(
    res.body.message,
    'Your contact request has been sent successfully.  You should hear from us soon.  Thank you!'
  );
});

test('fails creating inquiry if last inquiry was within last 24 hours', async t => {
  await koaRequest(app)
    .post('/en/contact')
    .set('Accept', 'application/json')
    .send({ email: 'test2@example.com' })
    .send({ message: 'Test message!' });

  const res = await koaRequest(app)
    .post('/en/contact')
    .set('Accept', 'application/json')
    .send({ email: 'test2@example.com' })
    .send({ message: 'Test message!' });

  t.is(res.status, 400);
  t.is(
    res.body.message,
    'You have reached the limit for sending contact requests.  Please try again.'
  );
});
