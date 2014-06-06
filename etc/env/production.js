
// # etc - env - production

var IoC = require('electrolyte')

module.exports = function() {
  var production = IoC.create('production')
  var app = this
  production(app)
}
