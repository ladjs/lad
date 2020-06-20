const path = require('path');

const locales = require('./locales');
const phrases = require('./phrases');

module.exports = {
  // see @ladjs/i18n for a list of defaults
  // <https://github.com/ladjs/i18n>
  // but for complete configuration reference please see:
  // <https://github.com/mashpie/i18n-node#list-of-all-configuration-options>
  phrases,
  defaultLocale: 'en',
  directory: path.join(__dirname, '..', 'locales'),
  ignoredRedirectGlobs: ['/auth/*', '/auth/**/*'],
  lastLocaleField: 'last_locale',
  locales
};
