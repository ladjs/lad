
// # etc - env - development

var IoC = require('electrolyte')

module.exports = function() {
  var development = IoC.create('development')
  var app = this
  development(app)
}
