
// # routes - my account

exports = module.exports = function(IoC, policies) {
  var app = this;

  // my account
  app.get(
    '/my-account',
    policies.ensureLoggedIn(),
    function(req, res) {
      res.render('my-account', {
        title: 'My Account'
      });
    }
  );

};

exports['@require'] = [ '$container', 'policies' ];
exports['@singleton'] = true;
