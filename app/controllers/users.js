
// # app - controllers - users

var validator = require('validator')
var _ = require('underscore')

exports = module.exports = function(User) {

  function index(req, res, next) {
    User.find({}, function(err, users) {
      if (err) return next(err)
      res.format({
        text: function() {
          res.send(users)
        },
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
    var msg = 'Send a POST request to /users'
    res.format({
      text: function() {
        res.send(msg)
      },
      html: function() {
        res.render('users/new')
      },
      json: function() {
        res.json({
          message: msg
        })
      }
    })
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
          res.send(user)
        },
        json: function() {
          res.json(user)
        }
      })

    })
  }

  function show() {

  }

  function edit() {

  }

  function load() {

  }

  function update() {

  }

  function destroy() {

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
