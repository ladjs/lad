
// # Pages

// Function for making sure text only uses url safe symbols
function makeSafe(thisText, allowSpace) {
    var w = "!@#$%^&*()+=[]\\\';,./{}|\":<>?"
      , s = 'abcdefghijklmnopqrstuvwxyz0123456789-_'
      , x = ['àáâãäå', 'ç', 'èéêë', 'ìíîï', 'ñ', 'ðóòôõöø', 'ùúûü', 'ýÿ']
      , r = ['a', 'c', 'e', 'i', 'n', 'o', 'u', 'y']
      , thisChar;
    if(allowSpace) {
      s = s + ' ';
    }
    thisText = thisText.toLowerCase();
    var newText = [];
    for (var i = 0; i < thisText.length; i++){
      thisChar = thisText.charAt(i);
      if(w.indexOf(thisChar) == -1) {
        if(s.match(''+thisChar+'')) {
          newText[i] = thisChar;
        } else {
          for (var j = 0; j < x.length; j++) {
            if(x[j].match(thisChar)){
              newText[i] = r[j];
            }
          }
        }
      }
    }
  var safe_url = newText.join('');
  safe_url = safe_url.replace(/\s/g , "-");
  return safe_url;
}

function toHandle(v) {
  return makeSafe(v, true);
}

module.exports = function(db) {
  var Pages = new db.Schema({
      title    : { type: String, required: true, unique: true }
    , handle   : { type: String, required: true, unique: true, set: toHandle }
    , meta     : {
        keywords: String,
        description: String
      }
    , content: String
    , created: { type: Date, default: Date.now }
    , updated: { type: Date, default: Date.now }
  });
  Pages.pre('save', function(next) {
    this.updated = Date.now();
    next();
  });
  return db.model('Pages', Pages);
};
