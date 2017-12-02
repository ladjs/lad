const test = require('ava');
const request = require('supertest');

const mongoose = require('../helpers/mongoose');
const web = require('../helpers/web');

test.before(mongoose.before);
test.beforeEach(web.beforeEach);
test.afterEach(web.afterEach);
test.after.always(mongoose.after);

test('redirects to correct locale', async t => {
  const res = await request(t.context.web).get('/');

  t.is(res.status, 302);
  t.is(res.headers.location, '/en/');
});

test('returns English homepage', async t => {
  const res = await request(t.context.web)
    .get('/en')
    .set('Accept', 'text/html');

  t.snapshot(res.text);
});

test('returns Spanish homepage', async t => {
  const res = await request(t.context.web)
    .get('/es')
    .set('Accept', 'text/html');

  t.snapshot(res.text);
});

test('returns English ToS', async t => {
  const res = await request(t.context.web)
    .get('/en/terms')
    .set('Accept', 'text/html');

  t.snapshot(res.text);
});

test('returns Spanish ToS', async t => {
  const res = await request(t.context.web)
    .get('/es/terms')
    .set('Accept', 'text/html');

  t.snapshot(res.text);
});
