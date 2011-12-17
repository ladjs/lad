
// # Groups

module.exports = function(db) {
  var Group = new db.Schema({
    _id: {
      type: String,
      required: true,
      unique: true,
      index: true
    }
  });
  return db.model('Group', Group);
};
