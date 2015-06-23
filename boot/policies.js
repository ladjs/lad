
// app - policies

var connectEnsureLogin = require('connect-ensure-login');
var auth = require('basic-auth');
var _ = require('underscore');

exports = module.exports = function(IoC, User) {

  // policy/middleware helpers
  var ensureLoggedIn = connectEnsureLogin.ensureLoggedIn;
  var ensureLoggedOut = connectEnsureLogin.ensureLoggedOut;

  // since there are issues with `passport-http` right now
  // this is implemented as a temporary solution
  function ensureApiToken(req, res, next) {
    var creds = auth(req);

    if (!creds || !_.isString(creds.name)) {
      res.statusCode = 401;
      return next({
        message: 'API token missing',
        param: 'username'
      });
    }

    User.findOne({
      api_token: creds.name
    }, function(err, user) {
      if (err) return next(err);
      if (!user) {
        return next({
          message: 'Invalid API token provided',
          param: 'username'
        });
      }
      req.user = user;
      next();
    });

  }

  var policies = {
    ensureLoggedIn: ensureLoggedIn,
    ensureLoggedOut: ensureLoggedOut,
    ensureApiToken: ensureApiToken,
    notApiRouteRegexp: /^(?!\/api\/).*$/
  };

  return policies;

};

exports['@singleton'] = true;
exports['@require'] = [ '$container', 'models/user' ];
