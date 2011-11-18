
// # Groups

module.exports = function(db) { 
  var Group = new db.Schema({
    name: {
      type: String,
      required: true,
      unique: true,
    }
  });
  return db.model('Group', Group);
};
