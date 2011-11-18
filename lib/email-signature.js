
// # emailSignature - returns an email signature

module.exports = function(type) {
  if(typeof type === "undefined") {
    type = "html";
  }
  var sig = '';
  switch(type) {
    case 'html':
      sig = ''
        + '<p>Thank you,</p>'
        + '--'
        + '<p>(Insert Company Name)</p>'
        + '<p><i>If you received this message in error, please forward it to: (insert site email)</i></p>';
      break;
    case 'text':
      sig = ''
        + 'Thank you,\n\n'
        + '--\n\n'
        + '(Insert Company Name)\n'
        + 'If you received this message in error, please forward it to: (insert site email)';
      break;
  }
  return sig;
};
