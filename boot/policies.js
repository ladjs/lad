
// app - policies

var connectEnsureLogin = require('connect-ensure-login')

exports = module.exports = function(IoC) {

  // policy/middleware helpers
  var ensureLoggedIn = connectEnsureLogin.ensureLoggedIn
  var ensureLoggedOut = connectEnsureLogin.ensureLoggedOut

  // Here is where you'd have things like isAdmin or isMember, for example

  var policies = {
    ensureLoggedIn: ensureLoggedIn,
    ensureLoggedOut: ensureLoggedOut
  }

  return policies

}

exports['@singleton'] = true
exports['@require'] = [ '$container' ]