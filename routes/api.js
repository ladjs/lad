
// # routes - api

var express = require('express');
var passport = require('passport');

exports = module.exports = function(IoC, policies) {

  var app = this;

  var api = IoC.create('controllers/api');
  var users = IoC.create('controllers/users');
  var signup = IoC.create('controllers/signup');
  var router = express.Router();

  // always return JSON with our API
  // this is helpful when doing CURL requests
  // since you don't need `-H `accept: application/json'`
  router.use(function(req, res, next) {
    req.headers.accept = 'application/json';
    next();
  });

  router.post(
    '/auth/signup',
    policies.ensureLoggedOut(),
    signup
  );

  router.post(
    '/auth/email',
    policies.ensureLoggedOut(),
    passport.authenticate('local', {
      session: false
    }),
    api.login
  );

  router.post(
    '/auth/facebook',
    policies.ensureLoggedOut(),
    passport.authenticate('facebook-token', {
      session: false
    }),
    api.login
  );

  router.post(
    '/auth/google',
    policies.ensureLoggedOut(),
    passport.authenticate('google-token', {
      session: false
    }),
    api.login
  );

  router.put(
    '/user',
    policies.ensureApiToken,
    // this `updateUser` method simply sets the
    // `req.params.id` value to `req.user.id`
    // and then calls `next()` (see above)
    api.updateUser,
    // note that we're just re-using the user
    // update method from users controller here
    // by no means is this the best approach
    // it is just here for simplicity to get started
    users.update
  );

  app.use('/api', router);

};

exports['@require'] = [ '$container', 'policies' ];
exports['@singleton'] = true;
