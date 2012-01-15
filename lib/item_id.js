module.exports = function(req, res, next) {
  // Check for item_id param
  if(!req.param('item_id')) {
    req.flash('error', 'Invalid item id');
    res.redirect('/');
  } else {
    next();
  }
};
