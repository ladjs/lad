
// # settings

var https = require('https')
var http = require('http')

exports = module.exports = function(IoC, settings) {

  var app = this

  // set the environment
  app.set('env', settings.server.env)

  if (settings.server.ssl.enabled)
    this.server = https.createServer(settings.server.ssl.options, this)
  else
    this.server = http.createServer(this)

}

exports['@require'] = [ '$container', 'igloo/settings' ]
