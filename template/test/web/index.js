const test = require('ava');

test('redirects to correct locale', async t => {
  const res = await web.get('/');
  t.is(res.status, 200);
  t.true(res.url.endsWith('/en'));
});

test('returns English homepage', async t => {
  const res = await web.get('/en', { headers: { Accept: 'text/html' } });

  t.snapshot(res.text);
});

test('returns Spanish homepage', async t => {
  const res = await web.get('/es', { headers: { Accept: 'text/html' } });

  t.snapshot(res.text);
});

test('returns English ToS', async t => {
  const res = await web.get('/en/terms', { headers: { Accept: 'text/html' } });

  t.snapshot(res.text);
});

test('returns Spanish ToS', async t => {
  const res = await web.get('/es/terms', { headers: { Accept: 'text/html' } });

  t.snapshot(res.text);
});
