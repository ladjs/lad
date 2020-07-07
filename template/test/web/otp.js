const test = require('ava');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const { factory } = require('factory-girl');

const _ = require('lodash');
const config = require('../../config');
const phrases = require('../../config/phrases');
const policies = require('../../helpers/policies');
const passport = require('../../helpers/passport');
const { authenticator } = require('otplib');
const { Users } = require('../../app/models');

const { before, beforeEach, afterEach, after } = require('../_utils');

test.before(async t => {
  // call setup
  await before(t);

  // setup userOTP factory
  factory.extend('user', 'userOTP', {
    [config.userFields.otpRecoveryKeys]: ['1', '2'],
    [config.passport.fields.otpToken]: '1',
    [config.passport.fields.otpEnabled]: true,
    [config.userFields.hasSetPassword]: true
  });

  // stub policies in routes/web/otp
  t.context.ensureLoggedIn = sinon.stub(policies, 'ensureLoggedIn');
  proxyquire('../../routes/web', {
    '../../helpers': {
      policies
    }
  });
  t.context.user = await factory.build('userOTP');
  t.context.ensureLoggedIn.callsFake(async (ctx, next) => {
    ctx.state.user = t.context.user;
    return next();
  });
});
test.after.always(after);
test.beforeEach(async t => {
  // save original environment variables so we can reset after test
  t.context.originalEnv = _.cloneDeep(process.env);

  // set AUTH_OTP_ENABLED to true and reload web server
  process.env.AUTH_OTP_ENABLED = 'true';

  // call setup
  await beforeEach(t);
});
test.afterEach.always(async t => {
  // reset environment variables
  process.env = _.cloneDeep(t.context.originalEnv);

  // call teardown
  await afterEach(t);
});

test('GET otp/login > successful', async t => {
  // get test server
  const { web } = t.context;

  // GET login page
  const res = await web.get(
    `/en${config.otpRoutePrefix}${config.otpRouteLoginPath}`
  );

  t.is(res.status, 200);
  t.snapshot(res.text);
});

test('POST otp/login > successful', async t => {
  // get test server
  const { web } = t.context;
  // setup stubs
  t.context.authenticate = sinon
    .stub(passport, 'authenticate')
    .withArgs('otp')
    .returns(() => {});
  proxyquire('../../app/controllers/web/auth', {
    '../../../helpers/passport': t.context.authenticate
  });
  t.context.authenticate.yields(null, true);

  // POST login page
  const res = await web
    .post(`/en${config.otpRoutePrefix}${config.otpRouteLoginPath}`)
    .send({
      passcode: '1234 124',
      otp_remember_me: 'true'
    });

  t.is(res.status, 200);
  t.is(res.body.redirectTo, '/en/dashboard');
});

test('POST otp/login > invalid OTP passcode', async t => {
  // get test server
  const { web } = t.context;
  // setup stubs
  t.context.authenticate = sinon
    .stub(passport, 'authenticate')
    .withArgs('otp')
    .returns(() => {});
  proxyquire('../../app/controllers/web/auth', {
    '../../../helpers/passport': t.context.authenticate
  });
  t.context.authenticate.yields(null, false);

  // POST login page
  const res = await web
    .post(`/en${config.otpRoutePrefix}${config.otpRouteLoginPath}`)
    .send({
      passcode: '1234 124',
      otp_remember_me: 'true'
    });

  t.is(res.status, 401);
  t.is(JSON.parse(res.text).message, phrases.INVALID_OTP_PASSCODE);
});

test('GET otp/setup > successful', async t => {
  // get test server
  const { web } = t.context;

  // GET setup page
  const res = await web.get(`/en${config.otpRoutePrefix}/setup`);

  t.is(res.status, 200);
  t.snapshot(res.text);
});

test('POST otp/setup > successful', async t => {
  // get test server
  const { web } = t.context;
  // setup stubs
  sinon.stub(Users.prototype, 'authenticate').returns({ user: true });

  // POST setup page
  const res = await web.post(`/en${config.otpRoutePrefix}/setup`).send({
    token: null,
    password: '!@K#NLK!#N'
  });

  t.is(res.status, 200);
  t.snapshot(res.text);
});

test('POST otp/setup > successful with token', async t => {
  // get test server
  const { web, user } = t.context;
  // setup stubs
  const verify = sinon.stub(authenticator, 'verify').returns(() => {});
  proxyquire('../../app/controllers/web/otp/setup', {
    otplib: {
      authenticator
    }
  });
  verify.returns(true);

  user[config.passport.fields.otpEnabled] = false;

  // POST setup page
  const res = await web.post(`/en${config.otpRoutePrefix}/setup`).send({
    token: '1',
    password: '!@K#NLK!#N'
  });

  t.is(res.status, 302);
  t.is(res.header.location, '/en/my-account/security');
  t.is(user[config.passport.fields.otpEnabled], true);
});

test('POST otp/setup > invalid token', async t => {
  // get test server
  const { web } = t.context;
  // setup stubs
  const verify = sinon.stub(authenticator, 'verify').returns(() => {});
  proxyquire('../../app/controllers/web/otp/setup', {
    otplib: {
      authenticator
    }
  });
  verify.returns(false);

  // POST setup page
  const res = await web.post(`/en${config.otpRoutePrefix}/setup`).send({
    token: '1',
    password: '!@K#NLK!#N'
  });

  t.is(res.status, 200);
  t.snapshot(res.text);
});

test('POST otp/setup > invalid blank password', async t => {
  // get test server
  const { web } = t.context;

  // POST setup page
  const res = await web.post(`/en${config.otpRoutePrefix}/setup`).send({
    token: null,
    password: null
  });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_PASSWORD);
});

test('POST otp/setup > incorrect password', async t => {
  // get test server
  const { web } = t.context;

  // POST setup page
  const res = await web.post(`/en${config.otpRoutePrefix}/setup`).send({
    token: null,
    password: 'test'
  });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_PASSWORD);
});

test('POST otp/disable > successful', async t => {
  // get test server
  const { web, user } = t.context;
  // setup stubs
  sinon.stub(Users.prototype, 'authenticate').returns({ user: true });

  // POST disable page
  const res = await web.post(`/en${config.otpRoutePrefix}/disable`).send({
    password: 'test'
  });

  t.is(res.status, 302);
  t.is(res.header.location, '/en/my-account/security');

  t.is(user[config.passport.fields.otpEnabled], false);
});

test('POST otp/disable > invalid blank password', async t => {
  // get test server
  const { web } = t.context;

  // POST disable page
  const res = await web.post(`/en${config.otpRoutePrefix}/disable`).send({
    password: null
  });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_PASSWORD);
});

test('POST otp/disable > incorrect password', async t => {
  // get test server
  const { web } = t.context;
  // setup stubs
  sinon.stub(Users.prototype, 'authenticate').returns({ user: false });

  // POST disable page
  const res = await web.post(`/en${config.otpRoutePrefix}/disable`).send({
    password: 'test'
  });

  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_PASSWORD);
});

test('POST otp/recovery > successful', async t => {
  // get test server
  const { web } = t.context;

  // POST disable page
  const res = await web.post(`/en${config.otpRoutePrefix}/recovery`);

  t.is(res.status, 302);
  t.is(res.header.location, `/en${config.verifyRoute}`);
});

test('GET otp/keys > successful', async t => {
  // get test server
  const { web } = t.context;

  // GET key page
  const res = await web.get(`/en${config.otpRoutePrefix}/keys`);

  t.is(res.status, 200);
  t.snapshot(res.text);
});

test('POST otp/keys > successful', async t => {
  // get test server
  const { web, user } = t.context;
  // setup stubs
  user[config.userFields.otpRecoveryKeys] = ['1', '2'];

  // POST keys page
  const res = await web
    .post(`/en${config.otpRoutePrefix}/keys`)
    .send({ recovery_key: '1' });

  t.is(res.status, 302);
  t.is(
    res.header.location,
    `/en${config.passportCallbackOptions.successReturnToOrRedirect}`
  );
  t.falsy(user[config.userFields.otpRecoveryKeys].includes('1'));
});

test('POST otp/keys > invalid recovery key', async t => {
  // get test server
  const { web } = t.context;

  // POST keys page
  const res = await web
    .post(`/en${config.otpRoutePrefix}/keys`)
    .send({ recovery_key: '1' });

  t.log(res);
  t.is(res.status, 400);
  t.is(JSON.parse(res.text).message, phrases.INVALID_RECOVERY_KEY);
});

test('POST otp/keys > recovery keys reset', async t => {
  // get test server
  const { web, user } = t.context;
  // setup stubs
  user[config.userFields.otpRecoveryKeys] = ['1'];

  // POST keys page
  const res = await web
    .post(`/en${config.otpRoutePrefix}/keys`)
    .send({ recovery_key: '1' });

  t.is(res.status, 302);
  t.is(res.header.location, '/en/my-account/security');
  t.true(user[config.userFields.otpRecoveryKeys] !== null);
});
