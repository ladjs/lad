const test = require('ava');
const sinon = require('sinon');

const { Inquiries } = require('../../app/models');

const { before, beforeEach, afterEach, after } = require('../_utils');

test.before(before);
test.after.always(after);
test.beforeEach(beforeEach);
test.afterEach.always(afterEach);

test('creates inquiry', async t => {
  const { web } = t.context;
  const res = await web
    .post('/en/support')
    .send({ email: 'test@example.com', message: 'Test message!' });

  t.is(res.status, 302);
  t.is(res.header.location, '/');
});

test('fails creating inquiry if last inquiry was within last 24 hours (HTML)', async t => {
  const { web } = t.context;
  t.context.countDocuments = sinon.stub(Inquiries, 'countDocuments')
    .resolves(1);

  const res = await web
    .post('/en/support')
    .set({ Accept: 'text/html' })
    .send({
      email: 'test2@example.com',
      message: 'Test message!'
    });

  t.is(res.status, 400);
  t.snapshot(res.text);

  t.context.countDocuments.restore();
});

test('fails creating inquiry if last inquiry was within last 24 hours (JSON)', async t => {
  const { web } = t.context;
  t.context.countDocuments = sinon.stub(Inquiries, 'countDocuments')
    .resolves(1);

  const res = await web.post('/en/support').send({
    email: 'test3@example.com',
    message: 'Test message!'
  });

  t.is(res.status, 400);
  t.is(
    JSON.parse(res.text).message,
    'You have reached the limit for sending support requests.  Please try again.'
  );

  t.context.countDocuments.restore();
});
