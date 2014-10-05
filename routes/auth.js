
// app - routes - auth

var passport = require('passport');

exports = module.exports = function(IoC, policies) {
  var app = this;

  // log in
  app.get(
    '/login',
    policies.ensureLoggedOut,
    function(req, res) {
      res.render('login', { title: 'Log In' });
    }
  );

  app.post(
    '/login',
    policies.ensureLoggedOut,
    passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      failureFlash: true,
      failureRedirect: '/login'
    })
  );

  // logout
  app.get(
    '/logout',
    policies.ensureLoggedIn,
    function(req, res) {
      req.logout();
      req.flash('success', 'You have successfully logged out');
      res.redirect('/');
    }
  );

  // sign up
  app.get('/signup', policies.ensureLoggedOut, function(req, res) {
    res.render('signup', { title: 'Sign Up' });
  });

  app.post(
    '/signup',
    policies.ensureLoggedOut,
    IoC.create('controllers/signup'),
    passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      successFlash: true,
      failureFlash: true,
      failureRedirect: true
    })
  );

  // forgot password
  app.get(
    '/forgot',
    policies.ensureLoggedOut,
    function(req, res) {
      res.render('forgot', {
        title: 'Forgot Password'
      });
    }
  );

  app.post(
    '/forgot',
    policies.ensureLoggedOut,
    IoC.create('controllers/forgot')
  );

  // reset password
  var reset = IoC.create('controllers/reset');

  app.get(
    '/reset/:reset_token',
    policies.ensureLoggedOut,
    reset.get
  );

  app.post(
    '/reset/:reset_token',
    policies.ensureLoggedOut,
    reset.post
  );

}

exports['@require'] = [ '$container', 'policies' ];
exports['@singleton'] = true;
