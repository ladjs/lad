
// # etc - init - views

var lessMiddleware = require('less-middleware')
var jadeAmd = require('jade-amd')
var flash = require('connect-flash')
var compress = require('compression')

exports = module.exports = function(IoC, settings) {

  var app = this

  // set the default views directory
  app.set('views', settings.views.dir)

  // set the default view engine
  app.set('view engine', settings.views.engine)

  // add flash message support
  app.use(flash())

  // add dynamic helpers for views
  app.use(function(req, res, next) {
    res.locals.req = req
    res.locals.messages = {
      success: req.flash('success'),
      error: req.flash('error'),
      info: req.flash('info'),
      warning: req.flash('warning')
    }
    next()
  })

  if (settings.env === 'development') {

    // make view engine output pretty
    app.locals.pretty = true

    // less middleware
    app.use(lessMiddleware(settings.less.path, settings.less.options))

    // jade-amd templates
    app.use(settings.jade.amd.path, jadeAmd.jadeAmdMiddleware(settings.jade.amd.options))

  }

  if (settings.env === 'production') {

    // enable view caching
    app.enable('view cache')

    // compress response data with gzip/deflate
    // this overwrites res.write and res.end functions
    app.use(compress())

    // jade-amd templates
    // TODO: use my gulp jade/requirejs task

  }

}

exports['@require'] = [ '$container', 'settings' ]
