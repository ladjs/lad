
// # Admin

var form     = require('express-form')
  , filter   = form.filter
  , field    = form.field
  , validate = form.validate
  , _        = require('underscore')
  , admins   = ['Super Admin', 'Admin'];

module.exports = function(app, db) {
  // ## Check Access
  var access = require('../schemas/user')(db).access;
  // ## Routes
  var routes = {
    index: function(req, res, next) {
      res.render('admin', {
        title: 'Admin'
      });
    }
  };
  // ## Index
  app.get('/admin', access(admins), routes.index);
};
