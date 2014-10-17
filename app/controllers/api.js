
// # api

exports = module.exports = function() {

  function login(req, res, next) {
    res.json(req.user);
  }

  function updateUser(req, res, next) {
    // we are simply re-using eskimo's default
    // user update method in the users controller
    // that ships with eskimo; just to save time
    // we are manually setting the id param here
    // and then calling `next()` to continue along
    req.params.id = req.user.id;
    next();
  }

  return {
    login: login,
    updateUser: updateUser
  };

};

exports['@singleton'] = true;
