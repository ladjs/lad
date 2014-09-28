
// app - routes

var serveStatic = require('serve-static')
var express = require('express')
var connectEnsureLogin = require('connect-ensure-login')
var ensureLoggedIn = connectEnsureLogin.ensureLoggedIn
var ensureLoggedOut = connectEnsureLogin.ensureLoggedOut
var passport = require('passport')

exports = module.exports = function(IoC, settings) {

  var app = this
  var middleware = {}

  // middleware helpers
  middleware.ensureLoggedIn = ensureLoggedIn
  middleware.ensureLoggedOut = ensureLoggedOut

  // home
  app.get(
    '/',
    IoC.create('controllers/home')
  )

  // log in
  app.get(
    '/login',
    middleware.ensureLoggedOut,
    function(req, res) {
      res.render('login', { title: 'Log In' })
    }
  )
  app.post(
    '/login',
    middleware.ensureLoggedOut,
    passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      failureFlash: true,
      failureRedirect: '/login'
    })
  )

  // logout
  app.get(
    '/logout',
    middleware.ensureLoggedIn,
    function(req, res) {
      req.logout()
      req.flash('success', 'You have successfully logged out')
      res.redirect('/')
    }
  )

  // sign up
  app.get('/signup', middleware.ensureLoggedOut, function(req, res) {
    res.render('signup', { title: 'Sign Up' })
  })
  app.post(
    '/signup',
    middleware.ensureLoggedOut,
    IoC.create('controllers/signup'),
    passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      successFlash: true,
      failureFlash: true,
      failureRedirect: true
    })
  )

  // forgot password
  app.get(
    '/forgot',
    middleware.ensureLoggedOut,
    function(req, res) {
      res.render('forgot', {
        title: 'Forgot Password'
      })
    }
  )
  app.post(
    '/forgot',
    middleware.ensureLoggedOut,
    IoC.create('controllers/forgot')
  )

  // reset password
  var reset = IoC.create('controllers/reset')
  app.get(
    '/reset/:reset_token',
    middleware.ensureLoggedOut,
    reset.get
  )
  app.post(
    '/reset/:reset_token',
    middleware.ensureLoggedOut,
    reset.post
  )

  // my account
  app.get(
    '/my-account',
    middleware.ensureLoggedIn,
    function(req, res) {
      res.render('my-account', {
        title: 'My Account'
      })
    }
  )

  // users controller + users routes
  IoC.create('controllers/users')(app, middleware)

  // static server
  app.use(serveStatic(settings.publicDir, settings.staticServer))

}

exports['@require'] = [ '$container', 'igloo/settings' ]
