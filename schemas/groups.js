
// # Groups

module.exports = function(db) {
  var Groups = new db.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      index: true
    }
  });
  return db.model('Groups', Groups);
};
