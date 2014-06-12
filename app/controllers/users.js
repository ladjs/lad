
// # users

var validator = require('validator')
var _ = require('underscore')

exports = module.exports = function(User) {

  function index(req, res, next) {
    User.find({}, function(err, users) {
      if (err) return next(err)
      res.format({
        html: function() {
          res.render('users', {
            users: users
          })
        },
        json: function() {
          res.json(users)
        }
      })
    })
  }

  function _new(req, res, next) {
    res.render('users/new')
  }

  function create(req, res, next) {
    if (!validator.isEmail(req.body.email) || !_.isString(req.body.email))
      return next({
        param: 'email',
        message: 'Invalid email address'
      })
    User.create({
      email: req.body.email
    }, function(err, user) {
      if (err) return next(err)
      res.format({
        html: function() {
          req.flash('success', 'Successfully created user')
          res.redirect('/users')
        },
        json: function() {
          res.json(user)
        }
      })
    })
  }

  function show(req, res, next) {
    User.findById(req.params.user, function(err, user) {
      if (err) return next(err)
      if (!user) return next(new Error('User does not exist'))
      res.render('users/show', {
        user: user
      })
    })
  }

  function edit(req, res, next) {
    User.findById(req.params.user, function(err, user) {
      if (err) return next(err)
      if (!user) return next(new Error('User does not exist'))
      res.render('users/edit', {
        user: user
      })
    })
  }

  function update(req, res, next) {
    User.findById(req.params.user, function(err, user) {
      if (err) return next(err)
      if (!user) return next(new Error('User does not exist'))
      if (!validator.isEmail(req.body.email) || !_.isString(req.body.email))
        return next({
          param: 'email',
          message: 'Invalid email address'
        })
      user.email = req.body.email
      user.save(function(err, user) {
        if (err) return next(err)
        res.format({
          html: function() {
            req.flash('success', 'Successfully updated user')
            res.redirect('/users/' + user.id)
          },
          json: function() {
            res.json(user)
          }
        })
      })
    })
  }

  function destroy(req, res, next) {
    User.findById(req.params.user, function(err, user) {
      if (err) return next(err)
      if (!user) return next(new Error('User does not exist'))
      user.remove(function(err) {
        if (err) return next(err)
        res.format({
          html: function() {
            req.flash('success', 'Successfully removed user')
            res.redirect('/users')
          },
          json: function() {
            res.json({
              id: user.id,
              deleted: true
            })
          }
        })
      })
    })
  }

  return {
    index: index,
    'new': _new,
    create: create,
    show: show,
    edit: edit,
    update: update,
    destroy: destroy
  }

}

exports['@singleton'] = true
exports['@require'] = [ 'models/user' ]
