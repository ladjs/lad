
// app - routes

var serveStatic = require('serve-static')
var express = require('express')
var connectEnsureLogin = require('connect-ensure-login')
var ensureLoggedIn = connectEnsureLogin.ensureLoggedIn
var ensureLoggedOut = connectEnsureLogin.ensureLoggedOut
var passport = require('passport')

exports = module.exports = function(IoC, settings) {

  var app = this

  // home
  app.get(
    '/',
    IoC.create('controllers/home')
  )

  // log in
  app.get(
    '/login',
    ensureLoggedOut(),
    function(req, res) {
      res.render('login', { title: 'Log In' })
    }
  )
  app.post(
    '/login',
    ensureLoggedOut(),
    passport.authenticate('local', {
      successReturnToOrRedirect: '/',
      failureFlash: true,
      failureRedirect: '/login'
    })
  )

  // logout
  app.get(
    '/logout',
    ensureLoggedIn(),
    function(req, res) {
      req.logout()
      req.flash('success', 'You have successfully logged out')
      res.redirect('/')
    }
  )

  // sign up
  app.get('/signup', ensureLoggedOut(), function(req, res) {
    res.render('signup', { title: 'Sign Up' })
  })
  app.post(
    '/signup',
    ensureLoggedOut(),
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
    ensureLoggedOut(),
    function(req, res) {
      res.render('forgot', {
        title: 'Forgot Password'
      })
    }
  )
  app.post(
    '/forgot',
    ensureLoggedOut(),
    IoC.create('controllers/forgot')
  )

  // reset password
  var reset = IoC.create('controllers/reset')
  app.get(
    '/reset/:reset_token',
    ensureLoggedOut(),
    reset.get
  )
  app.post(
    '/reset/:reset_token',
    ensureLoggedOut(),
    reset.post
  )

  // my account
  app.get(
    '/my-account',
    ensureLoggedIn(),
    function(req, res) {
      res.render('my-account', {
        title: 'My Account'
      })
    }
  )

  // users
  var users = IoC.create('controllers/users')
  var usersRouter = express.Router()
  usersRouter.get('/', users.index)
  usersRouter.get('/new', users.new)
  usersRouter.post('/', users.create)
  usersRouter.get('/:id', users.show)
  usersRouter.get('/:id/edit', users.edit)
  usersRouter.put('/:id', users.update)
  usersRouter.delete('/:id', users.destroy)
  app.use('/users', usersRouter)

  // static server
  app.use(serveStatic(settings.publicDir, settings.staticServer))

}

exports['@require'] = [ '$container', 'igloo/settings' ]
