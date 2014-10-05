
// # home

exports = module.exports = function() {

  function home(req, res, next) {
    res.format({
      html: function() {
        res.render('home');
      },
      json: function() {
        res.status(200).end();
      }
    });
  }

  return home;

};

exports['@singleton'] = true;
