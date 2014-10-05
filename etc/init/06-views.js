
// # views

var moment = require('moment')
var lessMiddleware = require('less-middleware')
var jadeAmd = require('jade-amd')
var compress = require('compression')

exports = module.exports = function(IoC, settings) {

  var app = this

  // set the default views directory
  app.set('views', settings.views.dir)

  // set the default view engine
  app.set('view engine', settings.views.engine)

  if (settings.server.env === 'development') {

    // make view engine output pretty
    app.locals.pretty = true

    // less middleware
    app.use(lessMiddleware(settings.less.path, settings.less.options))

    // jade-amd templates
    app.use(settings.jade.amd.path, jadeAmd.jadeAmdMiddleware(settings.jade.amd.options))

  }

  if (settings.server.env === 'production') {

    // enable view caching
    app.enable('view cache')

    // compress response data with gzip/deflate
    // this overwrites res.write and res.end functions
    app.use(compress())

    // jade-amd templates
    // TODO: use my gulp jade/requirejs task

  }

  // add dynamic helpers for views
  app.use(function(req, res, next) {
    var isXHR = req.xhr

    res.locals.req = req
    res.locals.messages = {
      success: req.flash('success'),
      error: req.flash('error'),
      info: req.flash('info'),
      warning: req.flash('warning')
    }
    res.locals.moment = moment
    if (settings.csrf.enabled && !isXHR)
      res.locals.csrf = req.csrfToken()
    else
      res.locals.csrf = ''
    next()
  })

}

exports['@require'] = [ '$container', 'igloo/settings' ]
