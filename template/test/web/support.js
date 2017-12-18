const test = require('ava');

test('creates inquiry', async t => {
  const res = await global.webRequest.post('/en/support', {
    body: { email: 'test@example.com', message: 'Test message!' }
  });
  t.is(res.status, 200);
  t.is(
    res.body.message,
    'Your support request has been sent successfully.  You should hear from us soon.  Thank you!'
  );
});

test('fails creating inquiry if last inquiry was within last 24 hours (HTML)', async t => {
  await global.webRequest.post('/en/support', {
    body: { email: 'test2@example.com', message: 'Test message!' }
  });

  const res = await global.webRequest.post('/en/support', {
    body: {
      email: 'test2@example.com',
      message: 'Test message!'
    },
    headers: {
      Accept: 'text/html'
    }
  });

  t.is(res.status, 400);
  t.snapshot(res.text);
});

test('fails creating inquiry if last inquiry was within last 24 hours (JSON)', async t => {
  await global.webRequest.post('/en/support', {
    body: {
      email: 'test3@example.com',
      message: 'Test message!'
    }
  });

  const res = await global.webRequest.post('/en/support', {
    body: {
      email: 'test3@example.com',
      message: 'Test message!'
    }
  });

  t.is(res.status, 400);
  t.is(
    res.body.message,
    'You have reached the limit for sending support requests.  Please try again.'
  );
});
