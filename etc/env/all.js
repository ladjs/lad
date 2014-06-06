
// # etc - env -all

var IoC = require('electrolyte')

module.exports = function() {
  var all = IoC.create('all')
  var app = this
  all(app)
}
