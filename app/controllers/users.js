
// # users

var validator = require('validator');
var paginate = require('express-paginate');

var _ = require('underscore');
var _str = require('underscore.string');
_.mixin(_str.exports());

exports = module.exports = function(User) {

  function index(req, res, next) {
    User.paginate({}, {page: req.query.page, limit:req.query.limit}, function(err, users, pageCount, itemCount) {
      if (err) {
        return next(err);
      }

      res.format({
        html: function() {
          res.render('users', {
            users: users,
            pageCount: pageCount,
            itemCount: itemCount
          });
        },
        json: function() {
          // inspired by Stripe's API response for list objects
          res.json({
            object: 'list',
            has_more: paginate.hasNextPages(req)(pageCount, users.length),
            data: users
          });
        }
      });
    });
  }

  function _new(req, res, next) {
    res.render('users/new');
  }

  function create(req, res, next) {

    // email
    if (_.isBlank(req.body.email)) {
      return next({
        message: 'Email was blank',
        param: 'email'
      });
    }

    // name
    if (_.isBlank(req.body.name)) {
      return next({
        message: 'First name was blank',
        param: 'name'
      });
    }

    // surname
    if (_.isBlank(req.body.surname)) {
      return next({
        message: 'Last name was blank',
        param: 'surname'
      });
    }

    // password validation
    User.validatePassword(req.body.password, function(errorMessage) {

      if (errorMessage) {
        return next({
          message: errorMessage,
          param: 'password'
        });
      }

      User.register({
        email: req.body.email,
        name: req.body.name,
        surname: req.body.surname
      }, req.body.password, registerUser);

    });

    function registerUser(err, user) {
      if (err) {
        return next(err);
      }

      res.format({
        html: function() {
          req.flash('success', 'Successfully created user with email %s', user.email);
          res.redirect('/users');
        },
        json: function() {
          res.json(user);
        }
      });
    }

  }

  function show(req, res, next) {
    User.findById(req.params.id, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        return next(new Error('User does not exist'));
      }

      res.format({
        html: function() {
          res.render('users/show', {
            user: user
          });
        },
        json: function() {
          res.json(user);
        }
      });
    });
  }

  function edit(req, res, next) {
    User.findById(req.params.id, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        return next(new Error('User does not exist'));
      }

      res.render('users/edit', {
        user: user
      });
    });
  }

  function update(req, res, next) {
    User.findById(req.params.id, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        return next(new Error('User does not exist'));
      }

      // email
      if (_.isBlank(req.body.email)) {
        return next({
          message: 'Email was blank',
          param: 'email'
        });
      }

      // name
      if (_.isBlank(req.body.name)) {
        return next({
          message: 'First name was blank',
          param: 'name'
        });
      }

      // surname
      if (_.isBlank(req.body.surname)) {
        return next({
          message: 'Last name was blank',
          param: 'surname'
        });
      }

      user.email = req.body.email;
      user.name = req.body.name;
      user.surname = req.body.surname;

      // if the user didn't enter password
      // then we don't need to change it
      if (_.isBlank(req.body.password)) {
        return user.save(saveUser);
      }

      User.validatePassword(req.body.password, function(errorMessage) {

        if (errorMessage) {
          return next({
            message: errorMessage,
            param: 'password'
          });
        }

        user.setPassword(req.body.password, function(err, user) {
          if (err) {
            return next(err);
          }

          user.save(saveUser);
        });

      });

      function saveUser(err, user) {
        if (err) {
          return next(err);
        }

        res.format({
          html: function() {
            req.flash('success', 'Successfully updated user with email %s', user.email);
            res.redirect('/users/' + user.id);
          },
          json: function() {
            res.json(user);
          }
        });
      }

    });
  }

  function destroy(req, res, next) {
    User.findById(req.params.id, function(err, user) {
      if (err) {
        return next(err);
      }

      if (!user) {
        return next(new Error('User does not exist'));
      }

      user.remove(function(err) {
        if (err) {
          return next(err);
        }

        res.format({
          html: function() {
            req.flash('success', 'Successfully removed user');
            res.redirect('/users');
          },
          json: function() {
            res.json({
              id: user.id,
              deleted: true
            });
          }
        });
      });
    });
  }

  return {
    index: index,
    'new': _new,
    create: create,
    show: show,
    edit: edit,
    update: update,
    destroy: destroy
   };

};

exports['@singleton'] = true;
exports['@require'] = [ 'models/user' ];
