const email = require('./email');
const locales = require('./locales');
const backup = require('./backup');

module.exports = [
  ['email', {}, email],
  ['locales', {}, locales],
  ['backup', {}, backup]
  // ...
  // [ name, options, function ]
];
