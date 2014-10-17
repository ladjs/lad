
// # routes - auth

var passport = require('passport');

exports = module.exports = function(IoC, policies, settings) {

  var app = this;

  // log in
  app.get(
    '/login',
    policies.ensureLoggedOut(),
    function(req, res) {
      res.render('login', { title: 'Log In' });
    }
  );

  app.post(
    '/login',
    policies.ensureLoggedOut(),
    passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      failureFlash: true,
      failureRedirect: '/login'
    })
  );

  // logout
  app.get(
    '/logout',
    policies.ensureLoggedIn(),
    function(req, res) {
      req.logout();
      req.flash('success', 'You have successfully logged out');
      res.redirect('/');
    }
  );

  // sign up
  app.get('/signup', policies.ensureLoggedOut(), function(req, res) {
    res.render('signup', { title: 'Sign Up' });
  });

  app.post(
    '/signup',
    policies.ensureLoggedOut(),
    IoC.create('controllers/signup')
  );

  // forgot password
  app.get(
    '/forgot',
    policies.ensureLoggedOut(),
    function(req, res) {
      res.render('forgot', {
        title: 'Forgot Password'
      });
    }
  );

  app.post(
    '/forgot',
    policies.ensureLoggedOut(),
    IoC.create('controllers/forgot')
  );

  // reset password
  var reset = IoC.create('controllers/reset');

  app.get(
    '/reset/:reset_token',
    policies.ensureLoggedOut(),
    reset.get
  );

  app.post(
    '/reset/:reset_token',
    policies.ensureLoggedOut(),
    reset.post
  );

  // ## Google Authentication
  if (settings.google.enabled) {

    app.get(
      '/auth/google',
      policies.ensureLoggedOut(),
      passport.authenticate('google', {
        scope: settings.google.scope
      })
    );

    app.get(
      '/auth/google/callback',
      policies.ensureLoggedOut(),
      passport.authenticate('google', {
        successFlash: true,
        successReturnToOrRedirect: '/',
        failureFlash: true,
        failureRedirect: '/login'
      })
    );

  }

  // ## Facebook Authentication
  if (settings.facebook.enabled) {

    app.get(
      '/auth/facebook',
      policies.ensureLoggedOut(),
      passport.authenticate('facebook', {
        scope: settings.facebook.scope
      })
    );

    app.get(
      '/auth/facebook/callback',
      policies.ensureLoggedOut(),
      passport.authenticate('facebook', {
        successFlash: true,
        successReturnToOrRedirect: '/',
        failureFlash: true,
        failureRedirect: '/login'
      })
    );

  }

};

exports['@require'] = [ '$container', 'policies', 'igloo/settings' ];
exports['@singleton'] = true;
