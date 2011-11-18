
// # Logout

module.exports = function(app, db) {
  app.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You have successfully logged out');
    res.redirect('/');
  });
};
