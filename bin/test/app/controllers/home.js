
// # app - controllers - home

exports = module.exports = function(db) {

  function home(req, res, next) {
    res.send(200)
  }

  return home

}

exports['@singleton'] = true
exports['@require'] = [ 'igloo/db' ]
