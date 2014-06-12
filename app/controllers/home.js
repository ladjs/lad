
// # home

exports = module.exports = function() {

  function home(req, res, next) {
    res.format({
      html: function() {
        res.render('home')
      },
      json: function() {
        res.send(200)
      }
    })
  }

  return home

}

exports['@singleton'] = true
