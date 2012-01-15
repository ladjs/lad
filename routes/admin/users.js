
// # Admin - Users

var form     = require('express-form')
  , filter   = form.filter
  , field    = form.field
  , validate = form.validate
  , _        = require('underscore')
  , admins   = ['super_admin', 'admin']
  , checkItemId = require('../../lib/item_id');

module.exports = function(app, db) {

  // ## Schemas
  var Users = db.model('Users')
    , access = Users.access(admins);

  // ## Routes
  var routes = {
      index: function(req, res, next) {
        Users
          .find({})
          .asc('email')
          .run(function(err, items) {
            if(_.isEmpty(items)) {
              req.flash('notice', 'No users exist');
              res.render('admin/users', {
                title: 'Admin - Users'
              });
            } else {
              res.render('admin/users', {
                  title: 'Admin - Users'
                , items: items
              });
            }
          });
      }
    , new: function(req, res, next) {
        res.render('admin/users/new', { title: 'Create User - Admin' });
      }
    , create: function(req, res, next) {
        // Check that form is valid
        if (!req.form.isValid) {
          res.render('admin/users/new', {
              title: 'Create User - Admin'
            , form: req.form
          });
        } else {
          delete req.form.password_confirmation;
          // Create the new user
          Users.create(req.form, function(err, item) {
            if (err) {
              // err, null
              if (/duplicate key/.test(err)) {
                req.flash('error', 'User already exists with the same email');
              } else {
                req.flash('error', err);
              }
              res.render('admin/users/new', {
                  title: 'Create User - Admin'
                , form: req.form
              });
            } else if (item) {
              // null, item
              req.flash('success', 'User was successfully created');
              res.redirect('/admin/users');
            } else {
              // null, null
              req.flash('error', 'An unknown error occured, try again');
              res.redirect('/admin/users/new');
            }
          });
        }
      }
    , show: function(req, res, next) {
        // Load the specific user
        Users.findById(req.param('item_id'), function(err, item) {
          if (err) {
            // err, null
            // Redirect to index of users
            req.flash('error', 'No user found with that id');
            res.redirect('/admin/users');
          } else if (item) {
            // null, item
            // Render view to show the user
            res.render('admin/users/show', {
                title: item.email
              , item: item
            });
          } else {
            // null, null
            req.flash('error', 'An unknown error occured, try again');
            res.redirect('/admin/users');
          }
        });
      }
    , edit: function(req, res, next) {
        // Load the specific user
        Users.findById(req.param('item_id'), function(err, item) {
          if (err) {
            // err, null
            req.flash('error', 'No user found with that id');
            res.redirect('/admin/users');
          } else if (item) {
            // null, item
            // Render view to edit the user
            res.render('admin/users/edit', {
                title: 'Edit User'
              , form: item
            });
          } else {
            // null, null
            req.flash('error', 'An unknown error occured, try again');
            res.redirect('/admin/users');
          }
        });
      }
    , update: function(req, res, next) {
        // Check that form is valid
        if (!req.form.isValid) {
          res.render('admin/users/edit/' + req.param('item_id'), {
              title: 'Edit User'
            , form: req.form
          });
        } else {
          // Check if user wants to change password
          if(req.form.password !== "" && req.form.password_confirmation !== "") {
            if(req.form.password !== req.form.password_confirmation) {
              req.flash('error', 'Password confirmation does not match entered password, try again');
              res.redirect('/admin/users');
            } else {
              delete req.form.password_confirmation;
            }
          } else {
            delete req.form.password;
            delete req.form.password_confirmation;
          }
          // Load the specific user
          Users.findById(req.param('item_id'), function(err, item) {
            if (err) {
              // err, null
              req.flash('error', 'No user found with that id');
              res.redirect('/admin/users');
            } else if (item) {
              // null, item
              // Iterate through object properties
              var changed = false;
              for(var attr in req.form) {
                if(item[attr] !== req.form[attr]) {
                  if(attr !== "name") {
                    changed = true;
                    item[attr] = req.form[attr];
                  } else {
                    if(item.name.first !== req.form.name.first) {
                      changed = true;
                      item.name.first = req.form.name.first;
                    }
                    if(item.name.last !== req.form.name.last) {
                      changed = true;
                      item.name.last = req.form.name.last;
                    }
                  }
                }
              }
              if(changed) {
                // Save the user's object
                item.save(function(err, item) {
                  if(err) {
                    if(/duplicate key/.test(err)) {
                      req.flash('error', 'An account is already registered for ' + req.form.email);
                      res.render('admin/users/edit/' + req.param('item_id'), {
                          title: 'Edit User'
                        , form: req.form
                      });
                    } else {
                      req.flash('error', err);
                      res.redirect('/admin/users');
                    }
                  } else if(item) {
                    req.flash('success', 'Changes to the user\'s account information have been saved');
                    res.redirect('/admin/users');
                  }
                });
              } else {
                req.flash('notice', 'No changes were made to the user\'s information');
                res.redirect('/admin/users');
              }
            } else {
              // null, null
              req.flash('error', 'An unknown error occured, try again');
              res.redirect('/admin/users');
            }
          });
        }
      }
    , delete: function(req, res, next) {
        // Load the specific user
        Users.findById(req.param('item_id'), function(err, item) {
          if (err) {
            // err, null
            req.flash('error', 'No user found with that id');
            res.redirect('/admin/users');
          } else if (item) {
            // null, item
            // Remove the user
            item.remove(function(err) {
              if(err) {
                req.flash('error', 'User was not removed');
              } else {
                req.flash('success', 'Successfully removed user');
              }
              res.redirect('/admin/users');
            });
          } else {
            // null, null
            req.flash('error', 'An unknown error occured, try again');
            res.redirect('/admin/users');
          }
        });
      }
  };

  // ## Users
  // Index
  app.get('/admin/users', access, routes.index);
  // New
  app.get('/admin/users/new', access, routes.new);
  // Create
  app.post(
      '/admin/users'
    , access
    , form(
          filter("package").trim()
        , validate("package").required().is(/[0-1]/)
        , filter("email").trim()
        , validate("email").required().isEmail()
        , filter("password").trim()
        , validate("password").required()
        , filter("password_confirmation").trim()
        , validate("password_confirmation").required()
            .equals(
              "field::password",
              "Password confirmation does not match entered password, try again")
        , filter("name.first").trim()
        , validate("name.first").required()
        , filter("name.last").trim()
        , validate("name.last").required()
        , filter("company").trim()
        , validate("company").required()
      )
    , routes.create
  );
  // Show
  app.get('/admin/users/:item_id', access, checkItemId, routes.show);
  // Edit
  app.get('/admin/users/edit/:item_id', access, checkItemId, routes.edit);
  // Update
  app.post(
      '/admin/users/update/:item_id'
    , access
    , checkItemId
    , form(
          filter("email").trim()
        , validate("email").required().isEmail()
        , filter("password").trim()
        , filter("password_confirmation").trim()
        , filter("name.first").trim()
        , validate("name.first").required()
        , filter("name.last").trim()
        , validate("name.last").required()
        , filter("company").trim()
        , validate("company").required()
      )
    , routes.update
  );
  // Delete
  app.post('/admin/users/delete/:item_id', access, checkItemId, routes.delete);
};
