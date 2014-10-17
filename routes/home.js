
// # routes - home

exports = module.exports = function(IoC) {

  var app = this;

  app.get('/', IoC.create('controllers/home'));

};

exports['@require'] = [ '$container' ];
exports['@singleton'] = true;
