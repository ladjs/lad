
// # Index

module.exports = function(app, db) {
  app.get('/', function(req, res) {
    // Layout set to false since we use extends and block overrides in the view
    res.render('index', { layout: false });
  });
};
