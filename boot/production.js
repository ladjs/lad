
// # boot - production

var compress = require('compression')

exports = module.exports = function(settings) {

  return function(app) {

    // enable view caching
    app.enable('view cache')

    // compress response data with gzip/deflate
    // this overwrites res.write and res.end functions
    app.use(compress())

    // jade-amd templates
    // TODO: use my gulp jade/requirejs task

  }

}

exports['@require'] = [ 'settings' ]
