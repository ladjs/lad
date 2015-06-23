
// # views

var moment = require('moment');

exports = module.exports = function(IoC, settings) {

  var app = this;

  // add dynamic helpers for views
  app.use(function(req, res, next) {

    res.locals.settings = settings;
    res.locals.req = req;
    res.locals.messages = {
      success: req.flash('success'),
      error: req.flash('error'),
      info: req.flash('info'),
      warning: req.flash('warning')
    };

    res.locals.moment = moment;

    if (settings.csrf.enabled)
      res.locals.csrf = req.csrfToken();

    next();

  });

};

exports['@require'] = [ '$container', 'igloo/settings' ];
