
// # Admin - Index

var form     = require('express-form')
  , filter   = form.filter
  , field    = form.field
  , validate = form.validate
  , _        = require('underscore')
  , admins   = ['super_admin', 'admin'];

module.exports = function(app, db) {

  // ## Schemas
  var Users = db.model('Users')
    , access = Users.access(admins);

  // ## Routes
  var routes = {
    index: function(req, res, next) {
      res.render('admin', {
          title: 'Admin'
        , layout: false
      });
    }
  };

  // ## Index
  app.get('/admin', access, routes.index);

};
