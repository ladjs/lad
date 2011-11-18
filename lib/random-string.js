
// # Create a random string

module.exports = function(strLength) {
  var str = ''
    , chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
  if (strLength === "undefined") {
    strLength = Math.floor(Math.random() * chars.length);
  }
  for (var i = 0; i < strLength; i++) {
    str += chars[Math.floor(Math.random() * chars.length)];
  }
  return str;
};
