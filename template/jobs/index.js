const email = require('./email');
const locales = require('./locales');

module.exports = [
  ['email', {}, email],
  ['locales', {}, locales]
  // ...
  // [ name, agendaOptions, function ]
];
