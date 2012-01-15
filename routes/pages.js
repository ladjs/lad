
// # Pages

var form     = require('express-form')
  , filter   = form.filter
  , field    = form.field
  , validate = form.validate
  , _        = require('underscore')
  , admins = ['super_admin', 'admin'];

// Check for handle param
function checkHandle(req, res, next) {
  if(!req.param('handle')) {
    req.flash('error', 'Invalid page handle');
    res.redirect('/');
  } else {
    next();
  }
}

module.exports = function(app, db) {
  // ## Schemas
  var Users = db.model('Users')
    , Pages = db.model('Pages')
    , access = Users.access;
  // ## Routes
  var routes = {
      index: function(req, res, next) {
        // Paginate the results and check for page and limit params
        var page = (req.param('page')) ? req.param('page') : 0
          , limit = (req.param('limit')) ? req.param('limit') : 10;
        // Load the pages ordered by date created
        Pages
          .find({})
          .asc('title')
          //.skip(page * limit)
          //.limit(limit)
          .run(function(err, pages) {
            if(_.isEmpty(pages)) {
              // Flash message
              req.flash('notice', 'No pages exist');
              res.render('pages', {
                title: 'Pages'
              });
            } else {
              // Render the view with pages
              res.render('pages', {
                  title: 'Pages'
                , pages: pages
                , currentPage: page
                , pageLimit: limit
              });
            }
          });
      }
    , new: function(req, res, next) {
        // Render the view with form to create a new page
        res.render('pages/new', { title: 'Create Page', layout: false });
      }
    , create: function(req, res, next) {
        // Check that form is valid
        if (!req.form.isValid) {
          res.render('pages/new', {
              title: 'Create Page'
            , form: req.form
            , layout: false
          });
        } else {
          // Create the new page
          Pages.create(req.form, function(err, page) {
            if (err) {
              // err, null
              if (/duplicate key/.test(err)) {
                req.flash('error', 'Page already exists with the same title and/or handle');
              } else {
                req.flash('error', err);
              }
              res.render('pages/new', {
                  title: 'Create Page'
                , form: req.form
                , layout: false
              });
            } else if (page) {
              // null, page
              req.flash('success', 'Page was successfully created');
              res.redirect('/pages');
            } else {
              // null, null
              req.flash('error', 'An unknown error occured, try again');
              res.redirect('/pages/new');
            }
          });
        }
      }
    , show: function(req, res, next) {
        // Load the specific page
        Pages.findOne({ handle: req.param('handle') }, function(err, page) {
          if (err) {
            // err, null
            // Redirect to index of pages
            req.flash('error', 'No page found with that handle');
            res.redirect('/');
          } else if (page) {
            // null, page
            // Render view to show the page
            res.render('pages/show', {
                title: page.title
              , meta: page.meta
              , page: page
            });
          } else {
            // null, null
            req.flash('error', 'An unknown error occured, try again');
            res.redirect('/');
          }
        });
      }
    , edit: function(req, res, next) {
        // Load the specific page
        Pages.findOne({ handle: req.param('handle') }, function(err, page) {
          if (err) {
            // err, null
            req.flash('error', 'No page found with that handle');
            res.redirect('/');
          } else if (page) {
            // null, page
            // Render view to edit the page
            res.render('pages/edit', {
                title: 'Edit Page'
              , form: page
              , layout: false
            });
          } else {
            // null, null
            req.flash('error', 'An unknown error occured, try again');
            res.redirect('/pages');
          }
        });
      }
    , update: function(req, res, next) {
        // Check that form is valid
        if (!req.form.isValid) {
          res.render('pages/edit/' + req.param('handle'), {
              title: 'Edit Page'
            , form: req.form
          });
        } else {
          // Load the specific page
          Pages.findOne({ handle: req.param('handle') }, function(err, page) {
            if (err) {
              // err, null
              req.flash('error', 'No page found with that handle');
              res.redirect('/pages');
            } else if (page) {
              // null, page
              // Save the page
              page.title = req.form.title;
              page.handle = req.form.page_handle;
              page.meta = req.form.meta;
              page.content = req.form.content;
              page.save(function(err) {
                if(err) {
                  res.render('/pages/edit/' + req.param('handle'), {
                      title: 'Edit Page'
                    , form: req.form
                  });
                } else {
                  req.flash('success', 'Successfully updated page');
                  res.redirect('/page/' + page.handle);
                }
              });
            } else {
              // null, null
              req.flash('error', 'An unknown error occured, try again');
              res.redirect('/pages');
            }
          });
        }
      }
    , delete: function(req, res, next) {
        // Load the specific page
        Pages.findOne({ handle: req.param('handle') }, function(err, page) {
          if (err) {
            // err, null
            req.flash('error', 'No page found with that handle');
            res.redirect('/pages');
          } else if (page) {
            // null, page
            // Remove the page
            page.remove(function(err) {
              if(err) {
                req.flash('error', 'Page was not removed');
              } else {
                req.flash('success', 'Successfully removed page');
              }
              res.redirect('/pages');
            });
          } else {
            // null, null
            req.flash('error', 'An unknown error occured, try again');
            res.redirect('/pages');
          }
        });
      }
  };
  // ## Index
  app.get('/pages', access(admins), routes.index);
  // ## New
  app.get('/pages/new', access(admins), routes.new);
  // ## Create
  app.post(
    '/pages'
    , access(admins)
    , form(
        filter("title")
      , validate("title").required()
      , filter("handle")
      , validate("handle").required()
      , filter("meta")
      , filter("content")
    )
    , routes.create
  );
  // ## Show
  app.get('/page/:handle', checkHandle, routes.show);
  // ## Edit
  app.get(
      '/pages/edit/:handle'
    , access(admins)
    , checkHandle
    , routes.edit);
  // ## Update
  app.post(
      '/pages/update/:handle'
    , access(admins)
    , checkHandle
    , form(
        filter("title")
      , validate("title").required()
      , filter("page_handle")
      , validate("page_handle").required()
      , filter("meta")
      , filter("content")
    )
    , routes.update);
  // ## Delete
  app.post('/pages/delete/:handle', access(admins), checkHandle, routes.delete);
  // ## Paginated Index
  app.get('/pages/:page/:limit', access(admins), routes.index);
};
