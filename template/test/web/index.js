const test = require('ava');
const app = require('../../web');
const { koaRequest } = require('../helpers');

test('redirects to correct locale', async t => {
  const res = await koaRequest(app).get('/');

  t.is(res.status, 302);
  t.is(res.headers.location, '/en/');
});

test('returns English homepage', async t => {
  const res = await koaRequest(app)
    .get('/en')
    .set('Accept', 'text/html');

  t.snapshot(res.text);
});

test('returns Spanish homepage', async t => {
  const res = await koaRequest(app)
    .get('/es')
    .set('Accept', 'text/html');

  t.snapshot(res.text);
});

test('returns English ToS', async t => {
  const res = await koaRequest(app)
    .get('/en/terms')
    .set('Accept', 'text/html');

  t.snapshot(res.text);
});

test('returns Spanish ToS', async t => {
  const res = await koaRequest(app)
    .get('/es/terms')
    .set('Accept', 'text/html');

  t.snapshot(res.text);
});
