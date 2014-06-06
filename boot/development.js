
// # boot - development

var lessMiddleware = require('less-middleware')
var jadeAmd = require('jade-amd')

exports = module.exports = function(settings) {

  return function(app) {

    // make view engine output pretty
    app.locals.pretty = true

    // less middleware
    app.use(lessMiddleware(settings.less.path, settings.less.options))

    // jade-amd templates
    app.use(settings.jade.amd.path, jadeAmd.jadeAmdMiddleware(settings.jade.amd.options))

  }

}

exports['@require'] = [ 'settings' ]
