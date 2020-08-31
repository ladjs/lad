const test = require('ava');

const utils = require('../utils');

test.beforeEach(utils.setupWebServer);

test('redirects to correct locale', async (t) => {
  const { web } = t.context;
  const res = await web.get('/');
  t.is(res.status, 302);
  t.is(res.headers.location, '/en');
});

test('returns English homepage', async (t) => {
  const { web } = t.context;
  const res = await web.get('/en').set({ Accept: 'text/html' });

  t.snapshot(res.text);
});

test('returns Spanish homepage', async (t) => {
  const { web } = t.context;
  const res = await web.get('/es').set({ Accept: 'text/html' });

  t.snapshot(res.text);
});

test('returns English ToS', async (t) => {
  const { web } = t.context;
  const res = await web.get('/en/terms').set({ Accept: 'text/html' });

  t.snapshot(res.text);
});

test('returns Spanish ToS', async (t) => {
  const { web } = t.context;
  const res = await web.get('/es/terms').set({ Accept: 'text/html' });

  t.snapshot(res.text);
});

test('GET /:locale/about', async (t) => {
  const { web } = t.context;
  const res = await web.get('/en/about');

  t.is(res.status, 200);
  t.assert(res.text.includes('About'));
});

test('GET /:locale/404', async (t) => {
  const { web } = t.context;
  const res = await web.get('/en/404');

  t.is(res.status, 200);
  t.assert(res.text.includes('Page not found'));
});

test('GET /:locale/500', async (t) => {
  const { web } = t.context;
  const res = await web.get('/en/500');

  t.is(res.status, 200);
  t.assert(res.text.includes('Server Error'));
});

test('GET /:locale/privacy', async (t) => {
  const { web } = t.context;
  const res = await web.get('/en/privacy');

  t.is(res.status, 200);
  t.assert(res.text.includes('Privacy Policy'));
});

test('GET /:locale/support', async (t) => {
  const { web } = t.context;
  const res = await web.get('/en/support');

  t.is(res.status, 200);
  t.assert(res.text.includes('Contact Support'));
});
