const test = require('ava');
const web = require('../../web');
const app = require('../../api');
const { koaRequest } = require('../helpers');

test(`fails when no creds are presented`, async t => {
  const res = await koaRequest(app).get('/v1/account');

  t.is(401, res.status);
});

// @TODO This won't work as we need the session to stay within the
//       supertest context as we're using two different apps(web/api)
//       Maybe we need to add a helper to work with register/login when testing the api.
test.failing(`returns current user's account`, async t => {
  const user = { email: 'test10@example.com', password: '!@#$%^&*$#@!^&^$#@!' };

  await koaRequest(web)
    .post('/signup')
    .set(user);

  const res = await koaRequest(app).get('/v1/account');

  t.is(200, res.status);
  t.is(res, {});
});
