
// # app - controllers - home

exports = module.exports = function() {

  function home(req, res, next) {
    res.send(200)
  }

  return home

}

exports['@singleton'] = true