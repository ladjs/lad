
// # etc - init - settings

exports = module.exports = function(IoC, settings) {

  var app = this

  // set the environment
  app.set('env', settings.server.env)

}

exports['@require'] = [ '$container', 'igloo/settings' ]
